// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICLXToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function getFeeDiscount(address user) external view returns (uint256);
}

interface IDocumentRegistry {
    function isVerified(bytes32 docHash) external view returns (bool);
}

contract CrossLedgerEscrow {

    enum TradeStatus { Created, Funded, DocumentsLodged, InTransit, Delivered, Completed, Disputed, Cancelled, Refunded }

    struct TradeConditions {
        bytes32[] requiredDocHashes;
        uint256   deliveryDeadline;
        bool      requiresBuyerConfirm;
        string    originPort;
        string    destinationPort;
        string    commodityType;
        uint256   quantityMT;
    }

    struct Trade {
        bytes32        tradeId;
        address        buyer;
        address        seller;
        uint256        amount;
        uint256        platformFee;
        TradeStatus    status;
        TradeConditions conditions;
        uint256        createdAt;
        uint256        fundedAt;
        uint256        completedAt;
        bool           buyerConfirmed;
        bool           sellerConfirmed;
    }

    address public owner;
    address public feeCollector;
    ICLXToken public clxToken;
    IDocumentRegistry public docRegistry;

    uint256 public constant BASE_FEE_BPS = 30;
    uint256 public constant DISPUTE_PERIOD = 7 days;

    mapping(bytes32 => Trade) public trades;
    mapping(address => bytes32[]) public buyerTrades;
    mapping(address => bytes32[]) public sellerTrades;
    mapping(address => bool) public arbitrators;
    mapping(address => bool) public kycVerified;

    uint256 public totalTradeVolume;
    uint256 public totalFeesCollected;
    uint256 public tradeCount;

    event TradeCreated(bytes32 indexed tradeId, address indexed buyer, address indexed seller, uint256 amount, string commodityType);
    event TradeFunded(bytes32 indexed tradeId, uint256 amount, uint256 fee);
    event DocumentsLodged(bytes32 indexed tradeId, bytes32[] docHashes);
    event ShipmentConfirmed(bytes32 indexed tradeId, string trackingRef);
    event DeliveryConfirmed(bytes32 indexed tradeId, address confirmedBy);
    event PaymentReleased(bytes32 indexed tradeId, address seller, uint256 amount);
    event TradeDisputed(bytes32 indexed tradeId, address raisedBy, string reason);
    event DisputeResolved(bytes32 indexed tradeId, address winner);
    event TradeCancelled(bytes32 indexed tradeId);
    event RefundIssued(bytes32 indexed tradeId, address buyer, uint256 amount);
    event KYCVerified(address indexed user);

    modifier onlyOwner() { require(msg.sender == owner, "Escrow: not owner"); _; }
    modifier onlyArbitrator() { require(arbitrators[msg.sender], "Escrow: not arbitrator"); _; }
    modifier tradeExists(bytes32 tradeId) { require(trades[tradeId].createdAt > 0, "Escrow: not found"); _; }

    constructor(address _clxToken, address _docRegistry, address _feeCollector) {
        owner = msg.sender;
        clxToken = ICLXToken(_clxToken);
        docRegistry = IDocumentRegistry(_docRegistry);
        feeCollector = _feeCollector;
        arbitrators[msg.sender] = true;
    }

    function createTrade(address _buyer, uint256 _amount, TradeConditions calldata _conditions)
        external returns (bytes32 tradeId)
    {
        require(kycVerified[msg.sender] && kycVerified[_buyer], "Escrow: KYC required");
        require(_buyer != address(0) && _buyer != msg.sender, "Escrow: invalid buyer");
        require(_amount > 0, "Escrow: zero amount");
        require(_conditions.deliveryDeadline > block.timestamp + 1 days, "Escrow: deadline too soon");

        tradeId = keccak256(abi.encodePacked(msg.sender, _buyer, _amount, block.timestamp, tradeCount++));

        Trade storage t = trades[tradeId];
        t.tradeId    = tradeId;
        t.seller     = msg.sender;
        t.buyer      = _buyer;
        t.amount     = _amount;
        t.status     = TradeStatus.Created;
        t.conditions = _conditions;
        t.createdAt  = block.timestamp;

        uint256 discount = clxToken.getFeeDiscount(_buyer);
        uint256 effectiveFee = BASE_FEE_BPS > discount / 100 ? BASE_FEE_BPS - discount / 100 : 0;
        t.platformFee = (_amount * effectiveFee) / 10000;

        buyerTrades[_buyer].push(tradeId);
        sellerTrades[msg.sender].push(tradeId);

        emit TradeCreated(tradeId, _buyer, msg.sender, _amount, _conditions.commodityType);
    }

    function fundEscrow(bytes32 tradeId) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.buyer, "Escrow: not buyer");
        require(t.status == TradeStatus.Created, "Escrow: invalid status");
        require(kycVerified[msg.sender], "Escrow: KYC required");

        bool success = clxToken.transferFrom(msg.sender, address(this), t.amount + t.platformFee);
        require(success, "Escrow: transfer failed");

        t.status   = TradeStatus.Funded;
        t.fundedAt = block.timestamp;
        emit TradeFunded(tradeId, t.amount, t.platformFee);
    }

    function lodgeDocuments(bytes32 tradeId, bytes32[] calldata docHashes) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.seller, "Escrow: not seller");
        require(t.status == TradeStatus.Funded, "Escrow: not funded");

        for (uint i = 0; i < t.conditions.requiredDocHashes.length; i++) {
            require(docRegistry.isVerified(t.conditions.requiredDocHashes[i]), "Escrow: doc not verified");
        }

        t.status = TradeStatus.DocumentsLodged;
        emit DocumentsLodged(tradeId, docHashes);
    }

    function confirmShipment(bytes32 tradeId, string calldata trackingRef) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.seller, "Escrow: not seller");
        require(t.status == TradeStatus.DocumentsLodged, "Escrow: docs not lodged");
        t.status = TradeStatus.InTransit;
        emit ShipmentConfirmed(tradeId, trackingRef);
    }

    function confirmDelivery(bytes32 tradeId) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.buyer, "Escrow: not buyer");
        require(t.status == TradeStatus.InTransit || t.status == TradeStatus.DocumentsLodged, "Escrow: cannot confirm");
        t.buyerConfirmed = true;
        emit DeliveryConfirmed(tradeId, msg.sender);
        _releaseFunds(tradeId);
    }

    function autoRelease(bytes32 tradeId) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(t.status == TradeStatus.InTransit || t.status == TradeStatus.DocumentsLodged, "Escrow: cannot release");
        require(block.timestamp > t.conditions.deliveryDeadline + 14 days, "Escrow: too early");
        _releaseFunds(tradeId);
    }

    function _releaseFunds(bytes32 tradeId) internal {
        Trade storage t = trades[tradeId];
        t.status      = TradeStatus.Completed;
        t.completedAt = block.timestamp;
        totalTradeVolume   += t.amount;
        totalFeesCollected += t.platformFee;
        if (t.platformFee > 0) clxToken.transfer(feeCollector, t.platformFee);
        clxToken.transfer(t.seller, t.amount);
        emit PaymentReleased(tradeId, t.seller, t.amount);
    }

    function raiseDispute(bytes32 tradeId, string calldata reason) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.buyer || msg.sender == t.seller, "Escrow: not party");
        require(t.status == TradeStatus.Funded || t.status == TradeStatus.DocumentsLodged || t.status == TradeStatus.InTransit, "Escrow: cannot dispute");
        t.status = TradeStatus.Disputed;
        emit TradeDisputed(tradeId, msg.sender, reason);
    }

    function resolveDispute(bytes32 tradeId, bool releaseToSeller) external onlyArbitrator tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(t.status == TradeStatus.Disputed, "Escrow: not disputed");
        if (releaseToSeller) {
            _releaseFunds(tradeId);
            emit DisputeResolved(tradeId, t.seller);
        } else {
            t.status = TradeStatus.Refunded;
            clxToken.transfer(t.buyer, t.amount + t.platformFee);
            emit RefundIssued(tradeId, t.buyer, t.amount + t.platformFee);
            emit DisputeResolved(tradeId, t.buyer);
        }
    }

    function cancelTrade(bytes32 tradeId) external tradeExists(tradeId) {
        Trade storage t = trades[tradeId];
        require(msg.sender == t.buyer || msg.sender == t.seller, "Escrow: not party");
        if (t.status == TradeStatus.Created) {
            t.status = TradeStatus.Cancelled;
            emit TradeCancelled(tradeId);
            return;
        }
        if (t.status == TradeStatus.Funded && msg.sender == t.buyer) {
            t.status = TradeStatus.Refunded;
            clxToken.transfer(t.buyer, t.amount + t.platformFee);
            emit RefundIssued(tradeId, t.buyer, t.amount + t.platformFee);
            return;
        }
        revert("Escrow: cannot cancel");
    }

    function verifyKYC(address user) external onlyOwner { kycVerified[user] = true; emit KYCVerified(user); }
    function addArbitrator(address arb) external onlyOwner { arbitrators[arb] = true; }
    function setFeeCollector(address _fc) external onlyOwner { feeCollector = _fc; }
    function getTradeStatus(bytes32 tradeId) external view returns (TradeStatus) { return trades[tradeId].status; }
    function getBuyerTrades(address buyer) external view returns (bytes32[] memory) { return buyerTrades[buyer]; }
    function getSellerTrades(address seller) external view returns (bytes32[] memory) { return sellerTrades[seller]; }
}
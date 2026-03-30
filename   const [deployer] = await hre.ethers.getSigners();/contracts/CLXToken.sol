// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CLXToken is IERC20 {
    string  public constant name     = "CrossLedger Token";
    string  public constant symbol   = "CLX";
    uint8   public constant decimals = 18;
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    address public owner;
    address public escrowContract;
    bool    public tradingEnabled;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    enum WalletTier { None, Basic, Professional, Enterprise }
    mapping(address => WalletTier) public walletTier;

    uint256 public constant FEE_DISCOUNT_BASIC        = 500;
    uint256 public constant FEE_DISCOUNT_PROFESSIONAL = 1500;
    uint256 public constant FEE_DISCOUNT_ENTERPRISE   = 3000;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;
    uint256 public constant MIN_STAKE_PERIOD  = 30 days;
    uint256 public constant STAKE_REWARD_RATE = 500;

    event TierAssigned(address indexed user, WalletTier tier);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event EscrowContractSet(address indexed escrow);
    event TradingEnabled();

    modifier onlyOwner() { require(msg.sender == owner, "CLX: not owner"); _; }
    modifier onlyEscrow() { require(msg.sender == escrowContract, "CLX: not escrow"); _; }

    constructor(address _treasury) {
        owner = msg.sender;
        _balances[_treasury] = TOTAL_SUPPLY;
        emit Transfer(address(0), _treasury, TOTAL_SUPPLY);
    }

    function totalSupply() external pure override returns (uint256) { return TOTAL_SUPPLY; }
    function balanceOf(address account) external view override returns (uint256) { return _balances[account]; }

    function transfer(address to, uint256 amount) external override returns (bool) {
        _transfer(msg.sender, to, amount); return true;
    }

    function allowance(address _owner, address spender) external view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount); return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(_allowances[from][msg.sender] >= amount, "CLX: insufficient allowance");
        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount); return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0) && to != address(0), "CLX: zero address");
        require(_balances[from] >= amount, "CLX: insufficient balance");
        _balances[from] -= amount;
        _balances[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function assignTier(address user, WalletTier tier) external onlyOwner {
        walletTier[user] = tier; emit TierAssigned(user, tier);
    }

    function getFeeDiscount(address user) external view returns (uint256) {
        WalletTier tier = walletTier[user];
        if (tier == WalletTier.Enterprise)   return FEE_DISCOUNT_ENTERPRISE;
        if (tier == WalletTier.Professional) return FEE_DISCOUNT_PROFESSIONAL;
        if (tier == WalletTier.Basic)        return FEE_DISCOUNT_BASIC;
        return 0;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "CLX: zero stake");
        require(_balances[msg.sender] >= amount, "CLX: insufficient balance");
        if (stakedBalance[msg.sender] > 0) _claimReward(msg.sender);
        _balances[msg.sender]  -= amount;
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;
        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        uint256 staked = stakedBalance[msg.sender];
        require(staked > 0, "CLX: nothing staked");
        require(block.timestamp >= stakeTimestamp[msg.sender] + MIN_STAKE_PERIOD, "CLX: too early");
        uint256 reward = _calculateReward(msg.sender);
        stakedBalance[msg.sender] = 0;
        _balances[msg.sender] += staked + reward;
        emit Unstaked(msg.sender, staked, reward);
    }

    function _calculateReward(address user) internal view returns (uint256) {
        uint256 duration = block.timestamp - stakeTimestamp[user];
        return (stakedBalance[user] * STAKE_REWARD_RATE * duration) / (365 days * 10000);
    }

    function _claimReward(address user) internal {
        uint256 reward = _calculateReward(user);
        if (reward > 0) { _balances[user] += reward; stakeTimestamp[user] = block.timestamp; }
    }

    function pendingReward(address user) external view returns (uint256) {
        if (stakedBalance[user] == 0) return 0;
        return _calculateReward(user);
    }

    function setEscrowContract(address _escrow) external onlyOwner {
        require(_escrow != address(0), "CLX: zero address");
        escrowContract = _escrow; emit EscrowContractSet(_escrow);
    }

    function enableTrading() external onlyOwner { tradingEnabled = true; emit TradingEnabled(); }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "CLX: zero address"); owner = newOwner;
    }
}
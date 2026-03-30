// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentRegistry {

    enum DocType {
        BillOfLading,
        CertificateOfOrigin,
        CommercialInvoice,
        PhytosanitaryCertificate,
        PackingList,
        CustomsDeclaration,
        InsuranceCertificate,
        InspectionReport,
        PurchaseAgreement,
        Other
    }

    enum VerificationStatus { Pending, Verified, Rejected, Revoked }

    struct Document {
        bytes32            docHash;
        DocType            docType;
        VerificationStatus status;
        address            submitter;
        address            verifier;
        uint256            submittedAt;
        uint256            verifiedAt;
        bytes32            tradeId;
        string             ipfsCid;
        string             description;
        bool               isPublic;
    }

    address public owner;
    mapping(bytes32 => Document) public documents;
    mapping(address => bytes32[]) public submitterDocs;
    mapping(bytes32 => bytes32[]) public tradeDocs;
    mapping(address => bool) public verifiers;

    uint256 public totalDocsSubmitted;
    uint256 public totalDocsVerified;

    event DocumentSubmitted(bytes32 indexed docHash, address indexed submitter, DocType docType, bytes32 tradeId, string ipfsCid);
    event DocumentVerified(bytes32 indexed docHash, address indexed verifier, DocType docType);
    event DocumentRejected(bytes32 indexed docHash, address indexed verifier, string reason);
    event DocumentRevoked(bytes32 indexed docHash, string reason);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyOwner() { require(msg.sender == owner, "Registry: not owner"); _; }
    modifier onlyVerifier() { require(verifiers[msg.sender], "Registry: not a verifier"); _; }
    modifier docExists(bytes32 docHash) { require(documents[docHash].submittedAt > 0, "Registry: not found"); _; }

    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true;
    }

    function submitDocument(
        bytes32 docHash,
        DocType docType,
        bytes32 tradeId,
        string calldata ipfsCid,
        string calldata description,
        bool isPublic
    ) external returns (bytes32) {
        require(docHash != bytes32(0), "Registry: empty hash");
        require(documents[docHash].submittedAt == 0, "Registry: already submitted");
        require(bytes(ipfsCid).length > 0, "Registry: no IPFS CID");

        documents[docHash] = Document({
            docHash:     docHash,
            docType:     docType,
            status:      VerificationStatus.Pending,
            submitter:   msg.sender,
            verifier:    address(0),
            submittedAt: block.timestamp,
            verifiedAt:  0,
            tradeId:     tradeId,
            ipfsCid:     ipfsCid,
            description: description,
            isPublic:    isPublic
        });

        submitterDocs[msg.sender].push(docHash);
        if (tradeId != bytes32(0)) tradeDocs[tradeId].push(docHash);
        totalDocsSubmitted++;

        emit DocumentSubmitted(docHash, msg.sender, docType, tradeId, ipfsCid);
        return docHash;
    }

    function submitDocumentBatch(
        bytes32[]     calldata docHashes,
        DocType[]     calldata docTypes,
        bytes32                tradeId,
        string[]      calldata ipfsCids,
        string[]      calldata descriptions
    ) external {
        require(docHashes.length == docTypes.length && docHashes.length == ipfsCids.length, "Registry: length mismatch");
        for (uint i = 0; i < docHashes.length; i++) {
            require(documents[docHashes[i]].submittedAt == 0, "Registry: duplicate");
            documents[docHashes[i]] = Document({
                docHash:     docHashes[i],
                docType:     docTypes[i],
                status:      VerificationStatus.Pending,
                submitter:   msg.sender,
                verifier:    address(0),
                submittedAt: block.timestamp,
                verifiedAt:  0,
                tradeId:     tradeId,
                ipfsCid:     ipfsCids[i],
                description: descriptions[i],
                isPublic:    true
            });
            submitterDocs[msg.sender].push(docHashes[i]);
            if (tradeId != bytes32(0)) tradeDocs[tradeId].push(docHashes[i]);
        }
        totalDocsSubmitted += docHashes.length;
    }

    function verifyDocument(bytes32 docHash) external onlyVerifier docExists(docHash) {
        Document storage doc = documents[docHash];
        require(doc.status == VerificationStatus.Pending, "Registry: not pending");
        doc.status     = VerificationStatus.Verified;
        doc.verifier   = msg.sender;
        doc.verifiedAt = block.timestamp;
        totalDocsVerified++;
        emit DocumentVerified(docHash, msg.sender, doc.docType);
    }

    function verifyDocumentBatch(bytes32[] calldata docHashes) external onlyVerifier {
        for (uint i = 0; i < docHashes.length; i++) {
            Document storage doc = documents[docHashes[i]];
            if (doc.submittedAt > 0 && doc.status == VerificationStatus.Pending) {
                doc.status     = VerificationStatus.Verified;
                doc.verifier   = msg.sender;
                doc.verifiedAt = block.timestamp;
                totalDocsVerified++;
                emit DocumentVerified(docHashes[i], msg.sender, doc.docType);
            }
        }
    }

    function rejectDocument(bytes32 docHash, string calldata reason) external onlyVerifier docExists(docHash) {
        require(documents[docHash].status == VerificationStatus.Pending, "Registry: not pending");
        documents[docHash].status = VerificationStatus.Rejected;
        emit DocumentRejected(docHash, msg.sender, reason);
    }

    function revokeDocument(bytes32 docHash, string calldata reason) external onlyVerifier docExists(docHash) {
        documents[docHash].status = VerificationStatus.Revoked;
        emit DocumentRevoked(docHash, reason);
    }

    function isVerified(bytes32 docHash) external view returns (bool) {
        return documents[docHash].status == VerificationStatus.Verified;
    }

    function getVerificationProof(bytes32 docHash) external view returns (
        bool verified, address verifier, uint256 verifiedAt, DocType docType, string memory ipfsCid, string memory description
    ) {
        Document storage doc = documents[docHash];
        return (doc.status == VerificationStatus.Verified, doc.verifier, doc.verifiedAt, doc.docType, doc.ipfsCid, doc.description);
    }

    function getTradeDocuments(bytes32 tradeId) external view returns (bytes32[] memory) {
        return tradeDocs[tradeId];
    }

    function allTradeDocsVerified(bytes32 tradeId) external view returns (bool) {
        bytes32[] storage docs = tradeDocs[tradeId];
        if (docs.length == 0) return false;
        for (uint i = 0; i < docs.length; i++) {
            if (documents[docs[i]].status != VerificationStatus.Verified) return false;
        }
        return true;
    }

    function getSubmitterDocuments(address submitter) external view returns (bytes32[] memory) {
        return submitterDocs[submitter];
    }

    function addVerifier(address v) external onlyOwner { verifiers[v] = true; emit VerifierAdded(v); }
    function removeVerifier(address v) external onlyOwner { verifiers[v] = false; emit VerifierRemoved(v); }
    function transferOwnership(address newOwner) external onlyOwner { require(newOwner != address(0)); owner = newOwner; }
}
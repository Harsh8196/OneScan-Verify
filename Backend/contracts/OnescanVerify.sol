pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OnescanVerify is Ownable {
    address private admin;
    struct IssuerRequest {
        address issuerAddress;
        string issuerCID;
        string contractType;
        bool approval; 
    }
    struct IssuerContract {
        address contractaddress;
        string contractCID;
        uint256 requestIndex;
    }
    struct IssuerContractArray {
        IssuerContract[] contractArray;
    }
    IssuerRequest[] public issuerRequest;
    uint256 public approvalCounts;
    mapping(address=>IssuerContractArray) issuerListOfContract;
    
    constructor() {
        admin = msg.sender;
    }

    function applyForRequest(string memory _issuerCID, string memory _contractType) public {
        issuerRequest.push(IssuerRequest({
            issuerAddress:msg.sender,
            issuerCID:_issuerCID,
            contractType:_contractType,
            approval:false
        }));
    }

    function approveRequest(uint256 _index) public onlyOwner{
        require(issuerRequest[_index].approval == false, 'Issuer request already approved.');
        issuerRequest[_index].approval = true;
        approvalCounts = approvalCounts + 1;
    }

    function getOwnerContract(address _issuerAddress) public view returns(IssuerContract[] memory) {
        return(issuerListOfContract[_issuerAddress].contractArray);
    }

    function createNewContract(uint256 _index) public {
        require(issuerRequest[_index].issuerAddress == msg.sender && issuerRequest[_index].approval == true,'Issuer Request is not approved.');
        address newContract = address(new physicalCertificate());
        
        issuerListOfContract[msg.sender].contractArray.push(IssuerContract({
            contractaddress:newContract,
            contractCID:issuerRequest[_index].issuerCID,
            requestIndex: _index
        }));
    }
}

contract physicalCertificate is Ownable,ERC721,ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Claimer {
        string certificateCID;
        string secretPassword;
        string secretPin;
        address claimerAddress;
        bool claimStatus;
    }

    mapping(uint256=>Claimer) tokenIdToClaimer;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721('Physical Certificate NFT','PCN'){}

    function mint(string memory _certificateCID,string memory _secretPassword,string memory _secretPin,string memory _tokenURI) public payable onlyOwner{
        require(msg.value >= 0.01 ether, 'Require minimum minting amount.');
        uint256 _newTokenId = _tokenIds.current();
        _mint(msg.sender,_newTokenId);
        _tokenIds.increment();
        _setTokenURI(_newTokenId, _tokenURI);
        setClaimerDetail(_certificateCID,_secretPassword,_secretPin,_newTokenId);
        
        
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function setClaimerDetail(string memory _certificateCID,string memory _secretPassword,string memory _secretPin,uint256 _tokenId) internal {
        Claimer memory newClaimerDetails = Claimer({
            certificateCID:_certificateCID,
            secretPassword:_secretPassword,
            secretPin:_secretPin,
            claimerAddress: address(0x00),
            claimStatus:false
        });
        tokenIdToClaimer[_tokenId] = newClaimerDetails;

    }

    function claimCertificate(uint256 _tokenId,string memory _secretPassword,string memory _secretPin) public returns (bool result){
        require(_exists(_tokenId), 'This Tokenid not exists.');
        Claimer memory newClaimerCertificate = tokenIdToClaimer[_tokenId];
        require(newClaimerCertificate.claimStatus = false, 'This certificate alredy claimed.');
        require((keccak256(abi.encodePacked(newClaimerCertificate.secretPassword)) == keccak256(abi.encodePacked(_secretPassword)) && keccak256(abi.encodePacked(newClaimerCertificate.secretPin)) == keccak256(abi.encodePacked(_secretPin))), 'This claimer is not authorize to claim certificate.');
        newClaimerCertificate.claimerAddress = msg.sender;
        newClaimerCertificate.claimStatus = true;
        transferOwnership(msg.sender);
        return newClaimerCertificate.claimStatus;
    }

    function checkAuthenticity(uint256 _tokenId,string memory _secretPin) public view returns (bool result) {
        require(_exists(_tokenId), 'This Tokenid not exists.');
        Claimer storage getCertificate = tokenIdToClaimer[_tokenId];
        require(keccak256(abi.encodePacked(getCertificate.secretPin)) == keccak256(abi.encodePacked(_secretPin)), 'Entered pin is not valid.');
        return true;
    }

    function getSecretPin() public view onlyOwner returns(uint256 _result) {
        uint256 randomNumber = uint256(vrf());
        return (randomNumber % 4);
    }

    function vrf() public view returns (bytes32 result) {
        uint[1] memory bn;
        bn[0] = block.number;
        assembly {
        let memPtr := mload(0x40)
        if iszero(staticcall(not(0), 0xff, bn, 0x20, memPtr, 0x20)) {
            invalid()
        }
        result := mload(memPtr)
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

}
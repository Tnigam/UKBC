// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'
import certificate_artifacts from '../../build/contracts/Certificate.json'
import certificatesCollection_artifacts from '../../build/contracts/Certificates.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);
var CertificatesCollection = contract(certificatesCollection_artifacts);
var Certificate = contract(certificate_artifacts);
var certificatesCollectionContractAddress ='0x57e223ccb8fb7273f92e7bb83b7a6d5b78b55f48';
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);
    CertificatesCollection.setProvider(web3.currentProvider);
    Certificate.setProvider(web3.currentProvider);
    
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
     
      CertificatesCollection.defaults({from: account});
    });
    

    self.checkOwner('0x95ae2b3b692d3ddd0d2d56d3b82738cc0937573c');
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

   
  checkOwner: function(certificateContractAddress) {
    var self = this;

    var cert;
    Certificate.at(certificateContractAddress).then(function(instance) {
      cert = instance;
      
      return cert.getApprover();
    }).then(function(value) {
      $('#name').html(value.valueOf());
     
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },
  getIssuer: function(certificateContractAddress) {
    var self = this;

    var cert;
    Certificate.at(certificateContractAddress).then(function(instance) {
      cert = instance;
      
      return cert.getIssuerAddress();
    }).then(function(value) {
      $('#issuer').html(value.valueOf());
     
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },
    DeployContract: function() {
    var self = this;

    var certsCol;
    CertificatesCollection.at(certificatesCollectionContractAddress).then(function(instance) {
    
      certsCol = instance;
      console.log(instance);
      //certsCol.newCertificate();
       return certsCol.newCertificate();
      }).then(function(value) {
        var newCertificateAddress = value.receipt.logs["0"].address; 
        console.log(value.receipt.logs["0"].address);
        var issuerAddress = $("#_issuerAddress").val();
        var name = $("#_name").val();
        var designation =$("#_designation").val();
        var logo = $("#_logo").val();
        var email = $("#_email").val();
        var company = $("#_company").val();
        
        self.setIssuer(newCertificateAddress,issuerAddress,name,designation,logo,email,company);
        self.getIssuer();
      }).catch(function(e) {
        console.log(e);
        self.setStatus("Error getting balance; see log.");
    });
  },
   setIssuer: function(certificateContractAddress,issuerAddress,name,designation,logo,email,company) {
    var self = this;

    var cert;
    Certificate.at(certificateContractAddress).then(function(instance) {
      cert = instance;
      

     //setIssuer(address _issuerAddress, string _name,string _designation,string _logo, string _email, string _company ) 
      return cert.setIssuer(issuerAddress,name,designation,logo,email,company);
    }).then(function(value) {console.log('function called');
      self.checkOwner(issuerAddress);
      self.setStatus("Complete.");
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },
 
 transferOwner: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var cert;
    CertificateIssuer.deployed().then(function(instance) {
      cert = instance;
    
      console.log(cert.getOwner());
      return cert.transferOwner(receiver, {from: account});
    }).then(function() {
      
      self.setStatus("Transaction complete! ");
      //cert.getOwner();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});

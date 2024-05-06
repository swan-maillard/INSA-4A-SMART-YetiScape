var uuid = require('uuid');

var calls = []; //Tableau qui contient la liste des calls

// Permet de créer les informations du call
function Call() {
  this.id = uuid.v1();
  this.started = Date.now();
  this.peers = [];
}

// Stocker les informations du call en JSON pour le client
Call.prototype.toJSON = function () {
  return { id: this.id, started: this.started, peers: this.peers };
};

// Ajouter un client au call
Call.prototype.addPeer = function (peerId) {
  this.peers.push(peerId);
};

// Retirer un client au call
Call.prototype.removePeer = function (peerId) {
  var index = this.peers.lastIndexOf(peerId);
  if (index !== -1) this.peers.splice(index, 1);
};

// Permet de créer le call et de le stocker
Call.create = function () {
  var call = new Call();
  calls.push(call);
  return call;
};

// Permet de récupérer un call
Call.get = function (id) {
  return (calls.filter(function (call) {
    return id === call.id;
  }) || [])[0];
};

Call.getAll = function () {
  return calls;
};

module.exports = Call;

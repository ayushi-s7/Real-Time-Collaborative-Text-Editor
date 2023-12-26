function ipv4ToBinary(ipv4Address) {
  var octets = ipv4Address.split('.');
  var binaryRepresentation = octets.map(function(octet) {

    var binaryOctet = parseInt(octet).toString(2).padStart(8, '0');
    return binaryOctet;
  });
  return binaryRepresentation;
}

function binaryToIPv4(binaryRepresentation) {
  
  var binaryOctets = binaryRepresentation.split('.');

  var decimalIPv4 = binaryOctets.map(function(binaryOctet) {
   
    var decimalOctet = parseInt(binaryOctet, 2);
    return decimalOctet;
  }).join('.');

  return decimalIPv4;
}
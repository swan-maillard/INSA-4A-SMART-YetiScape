rm -fr cert
mkdir cert
openssl genrsa -out cert/key.pem
openssl req -new -key cert/key.pem -out cert/csr.pem
openssl x509 -req -days 365 -in cert/csr.pem -signkey cert/key.pem -out cert/cert.pem

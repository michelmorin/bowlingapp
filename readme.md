the local cert key uses passphrase of "bowlingapp" in case that is needed.

Used the following commands to generate them:
> openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
> openssl rsa -in keytmp.pem -out key.pem
# Backend

## Project setup

```bash
$ npm install -g @nest/cli
$ npm install
$ docker run -p 6333:6333 -d qdrant/qdrant
```


## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
To make app work correctly, right after setup upload files via POST /upload endpoint. RAG will use these files  
In Postman use POST method t0 /upload using formdata with key 'files' and value - actual PDF and TXT files
## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Frontend

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# production mode
$ npm run build
$ npm run preview

# watch mode
$ npm run dev
```
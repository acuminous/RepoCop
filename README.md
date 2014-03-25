# RepoCop
RepoCop monitors your source code repositories and reports violations to committers.

## Primary Directives
1. Each repository must have a file called package.json in the root directory
1. package.json must contain at least the following elements
```json
{
  "name": "<Your project name>",
  "description": "Your project description"
}
```

## Installation
```bash
mkdir -p $INSTALL_DIR
git clone https://github.com/acuminous/RepoCop.git $INSTALL_DIR
cd $INSTALL_DIR
npm install
./node_modules/.bin/gulp build
NODE_ENV=production node cluster.js --server.host=$HOST --server.port=$PORT
```

## Updating to the latest version
```bash
cd $INSTALL_DIR
git fetch
git reset --hard origin/master  
npm install
./node_modules/.bin/gulp build
kill -s SIGUSR2 $(<"repocop.pid")
```

## Production Configuration
RepoCop requires you to define organisations in conf/private.json, e.g.
```json
{
    "survey": {
        "organisations": [
            {
                "name": "<organisation name>",
                "providerKey": "github",
                "authentication": {
                    "type": "basic",
                    "username": "<machine user>",
                    "password": "<application key>"
                }
            },
            {
                "name": "<organisation name>",
                "providerKey": "bitbucket",
                "authentication": {
                    "type": "basic",
                    "username": "<machine user>",
                    "password": "<application key>"
                }
            }            
        ]
    }
}
```
**If you fork this project do not check this file into source control**


The application key should have access to the following roles

### GitHub
 1. repo
 1. public_repo
 1. user:email
 1. repo:status
 1. read:org

### BitBucket
 1. TODO
 1. TODO

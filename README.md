# RepoCop
RepoCop monitors your source code repositories and reports violations to committers.

## Primary Directives
1. Each repository should have a file called repocop.json in the root directory
1. repocop.json should contain at least the following elements
```json
{
  "importance": "<critical|high|medium|low>"
}
```
## Prerequisits
1. node
1. git

## Installation
Thanks to all sorts of interactive shenanigans with ssh and bower you are best running this by hand
```bash
mkdir -p $INSTALL_DIR
git clone https://github.com/acuminous/RepoCop.git $INSTALL_DIR
cd $INSTALL_DIR
npm install
./node_modules/.bin/gulp build
NODE_ENV=production node server.js --server.host=$HOST --server.port=$PORT
```

## Updating to the latest version
```bash
cd $INSTALL_DIR
git fetch
git reset --hard origin/master  
npm install
./node_modules/.bin/gulp build
kill -s SIGUSR2 $REPOCOP_PID
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
            }          
        ]
    }
}
```

The application key should have access to the following roles

### GitHub
 1. repo
 1. public_repo
 1. user:email
 1. repo:status
 1. read:org

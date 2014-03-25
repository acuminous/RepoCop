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
git clone 
cd <install-path>
npm install RepoCop
npm start
```

### Production Configuration
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
 1. TODO
 1. TODO

### BitBucket
 1. TODO
 1. TODO

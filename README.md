## Setup Locally

### Database Setup

-   Make sure you have a [mariadb build installed on your computer](https://mariadb.com/resources/blog/installing-mariadb-10-1-16-on-mac-os-x-with-homebrew/)

*   After step 7 (run `brew services start mariadb` and `mysql_install_db`), you may need to run `sudo mariadb_secure_installation`. Follow instructions to set a root password.

-   Access mariadb with `mariadb -u root -p`.
-   Create the chime database `CREATE DATABASE chimetest`
-   Exit mariadb, then import the structure `mysql -u root -p chimetest < testbackup.sql` (if sudo is required then something has gone wrong. reinstall.)
-   Make sure that you have a superuser (`GRANT ALL PRIVILEGES ON *.* TO '<username>'@'localhost';`), set the credentials of this user to **DB_SUPERUSER** and **DB_SUPERUSERPW** in .env
-   Also make sure that you have a normal user (do not grant privileges), set the credentials of this user to DB_USER and DB_USERPW in .env

### Server Setup

The chime server runs on node.js, to set up your dependencies, navigate into the directory and run: `npm install`
to start the server, run: `npm start`

### Frontend Setup

Once the server is running at localhost:8000 (be sure SERVER_HOST and SERVER_PORT in the .env are set to localhost and 8000 respectively), simply open index.html in any browser.
To display the noised data, click the "Noise that data!" button.

### Env Structure

If you do not already have a .env in CSCI2390-Final/ then create one `touch CSCI2390-Final/.env`

Insert the following structure into that file.

```
SESSION_SECRET="<random_string>" (e.g. 1234)
SERVER_HOST="127.0.0.1"
SERVER_PORT="8000"
DB_HOST="<database_host>" (e.g. 127.0.0.1)
USAGE_PERIOD_EXPIRATION="<random_string>" (e.g. 5555)
DB_NAME="<chime_database_name>"
DB_USER="<chime_user_name>"
DB_USERPW="<chime_user_password>"
DB_SUPERUSER="<superuser_name>"
DB_SUPERUSERPW="<superuser_password>"
```

## Endpoint Overview

| endpoint                | method | body                                                                                                                                            | returns                                                                                                                                           |
| ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| /2390                   | get    | null                                                                                                                                            | string                                                                                                                                            |
|                         |        |                                                                                                                                                 |
| /2390/db                | get    | null                                                                                                                                            | result: (json) list of users                                                                                                                      |
|                         |        |                                                                                                                                                 |
| /2390/users_per_group   | get    | addNoise (bool)                                                                                                                                 | result: (json) count of users in each group (noised if addNoise = true)                                                                           |
|                         |        |                                                                                                                                                 |
| /2390/posts_per_group   | get    | addNoise (bool)                                                                                                                                 | result: (json) count of posts in each group (noised if addNoise = true)                                                                           |
|                         |        |                                                                                                                                                 |
| /2390/emojis_per_group  | get    | addNoise (bool)                                                                                                                                 | result: (json) count of each main emoji posted in each group (noised if addNoise = true)                                                          |
|                         |        |                                                                                                                                                 |
| /2390/histogram         | get    | null                                                                                                                                            | result: (json) list of 50 instances of count of users in group `test_default`, all noised                                                         |


## Notes

-   IDs are assigned automatically by an increment function, so retrieving items with ID greater than n will fetch items created after the item with ID n.

-   If you get `error 1449`, go into `chime.sql` and make sure the definer under each view is set to `'youruser'@'yourhost'`.
-   
-   All timestamps are UTC

## Environment

`.env` example:

```
# String used to secure session data
SESSION_SECRET="chickenzrule"
# Name of database
DB_NAME="chime"
# Name of database user
DB_USER="username"
# Password for database
DB_USERPW="password"
# Database host
DB_HOST="localhost"
# Superuser username for database (used for testing)
DB_SUPERUSER="superusername"
# Superuser password for database (used for testing)
DB_SUPERUSERPW="superpassword"
# Time for usage period to expire in ms
USAGE_PERIOD_EXPIRATION=5000
# Server hostname
SERVER_HOST="localhost"
# Server port on host
SERVER_PORT=3000
```

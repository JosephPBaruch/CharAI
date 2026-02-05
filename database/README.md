# Development Database

Initially we used a sqlite database but it was decided that we did not want to use this because sqlite databases are housed in a file which only allows one reader or writer at a time due to locking the file down. It wwould also need to be stored in the container which would complicate things for a production environment. Because of this, we switched to postgressql database.

Using this locally requires setting up a a docker container using the ./pipeline.sh script to run a postgres database. After, this can be finished ß

const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://44.200.223.94:7687',
                  neo4j.auth.basic('neo4j', 'hammer-laughs-oar'), 
                  {/* encrypted: 'ENCRYPTION_OFF' */});

const session = driver.session({ database: "neo4j" });

module.exports = {neo4j, driver, session};
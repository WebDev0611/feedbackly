const dbDumpCmd = 'mongorestore --db feedbackly-cypress ./cypress/db_dump/feedbackly-cypress';
const dbDropCmd = 'mongo feedbackly-cypress --eval "db.dropDatabase()"';
const { exec } = cy;

const dbManagement = (done) => {
  exec(dbDropCmd).then(() => {
    console.log('dropped DB');
  });
  exec(dbDumpCmd).then(() => {
    console.log('dumped DB');
    setTimeout(() => console.clear(), 500);
    done();
  });
};

export default dbManagement;

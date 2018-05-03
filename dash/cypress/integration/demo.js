import dbManagement from '../db';

describe('demo test', ()=>{
  before(dbManagement);
  it('passes test',()=>{
    expect(true).to.be.true
  })
})
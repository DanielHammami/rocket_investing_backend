var app = require("../app")
var request = require("supertest")

// tests Sign-up :
test("users sign-up - Body correct", async (done) => {
  await request(app).post('/sign-up')
    .send({ userName: "John", password: "123456" })
    .expect(200)
    .expect({ result: true, token: 1234 });
  done();
 });

 test("users sign-up - Body incomplet", async (done) => {
  await request(app).post('/sign-up')
    .send({ userName: "John" })
    .expect(200)
    .expect({ result: false });
  done();
 });

 test("users sign-up - Body incomplet", async (done) => {
  await request(app).post('/sign-up')
    .send({ userName: "", password: "" })
    .expect(200)
    .expect({ result: false });
  done();
 });


 
// tests Sign-in :
test("users sign-in - Body correct", async (done) => {
  await request(app).post('/sign-in')
    .send({ userName: "John", password: "123456" })
    .expect(200)
    .expect({ result: true, token: 1234 });
  done();
 });

 test("users sign-in - Body incomplet", async (done) => {
  await request(app).post('/sign-in')
    .send({ userName: "John" })
    .expect(200)
    .expect({ result: false });
  done();
 });

 test("users sign-in - Body incomplet", async (done) => {
  await request(app).post('/sign-in')
    .send({ userName: "", password: "" })
    .expect(200)
    .expect({ result: false });
  done();
 });



// tests Whishlist :
test("users Whishlist - Body correct", async (done) => {
  await request(app).get('/whishlist')
    .query({ token: 1234 })
    .expect(200)
    .expect({ result: true, users: 1234 });
  done();
 });

test("users Whishlist - Body incomplet", async (done) => {
  await request(app).get('/whishlist')
    .query({ userName: "john" })
    .expect(200)
    .expect({ result: false });
  done();
 });



// tests Strategy :
test("users Strategy - Body correct", async (done) => {
  await request(app).get('/strategy')
    .query({ strategy: "active" })
    .expect(200)
    .expect({ result: true, portofolios:  1234 });
  done();
 });

 test("users Strategy - Body correct", async (done) => {
  await request(app).get('/strategy')
    .query({ strategy: "passive" })
    .expect(200)
    .expect({ result: true, portofolios:  1234 });
  done();
 });

test("users Strategy - Body incomplet", async (done) => {
  await request(app).get('/strategy')
    .query({ strategy: "" })
    .expect(200)
    .expect({ result: false });
  done();
 });

 test("users Strategy - Body incomplet", async (done) => {
  await request(app).get('/strategy')
    .query({ name: 1234 })
    .expect(200)
    .expect({ result: false });
  done();
 });



// tests Portofolio :
test("users Portofolio - Body correct", async (done) => {
  await request(app).get('/portofolio')
    .query({ name: "60/40" })
    .expect(200)
    .expect({ result: true, portofolios: 1234 });
  done();
 });

test("users Portofolio - Body incomplet", async (done) => {
  await request(app).get('/portofolio')
    .query({ name: "" })
    .expect(200)
    .expect({ result: false });
  done();
 });



// // -------------------------EXEMPLE------------------------------------------- //
// test("Réservation d'un trajet - Body correct", async (done) => {
//  await request(app).post('/orderRide')
//    .send({ token: 1234, depart: "56 Boulevard Pereire 75017 Paris", destination: "145 Avenue de Villiers 75017 Paris" })
//    .expect(200)
//    .expect({ result: true, tempsAttente: 10 });
//  done();
// });

// test("Réservation d'un trajet - Body incomplet", async (done) => {
//   await request(app).post('/orderRide')
//     .send({ depart: "56 Boulevard Pereire 75017 Paris", destination: "145 Avenue de Villiers 75017 Paris" })
//     .expect(200)
//     .expect({ result: false });
//   done();
//  });

//  test("Liste des précédentes courses - Query correct", async (done) => {
//   await request(app).get('/passedRides')
//     .query({ token: 1234 })
//     .expect(200)
//     .expect({ result: true, rides: [{
//       courseId: 55,
//       depart: '56 Boulevard Pereire 75017 Paris',
//       destination: '145 Avenue de Villiers 75017 Paris'
//     }] });
//   done();
//  });
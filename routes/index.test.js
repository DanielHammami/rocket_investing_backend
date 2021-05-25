var app = require("../app")
var request = require("supertest")

// tests Sign-in :
test("users sign-in - Body correct", async (done) => {
  await request(app).post('/sign-in')
    .send({ usernameFromFront: "Test", passwordFromFront: "test" })
    .expect(200)
    .expect({
      result: true, user:{
        portofoliosId: [ '60a0cf7ca76f131702edd22f' ],
        _id: '60acf26f4befa00015da7f9d',
        username: 'Test',
        password: '$2b$10$NzKihMRtlZVtdIjtZqQJwurNghxuewZ6eG8OG1la8D4I/K0uqjJ.6',
        token: 'sWJxSP13ZBZEtBWzjSC4neJkBKuU080j',
        __v: 11
      }, token: "sWJxSP13ZBZEtBWzjSC4neJkBKuU080j", error: []
    });
  done();
});

test("users sign-in - Body incomplet", async (done) => {
  await request(app).post('/sign-in')
    .send({ usernameFromFront: "Test", passwordFromFront: "" })
    .expect(200)
    .expect({ result: false, user: null, error: ['champs vides'], token: null });
  done();
});

test("users sign-in - Body vide", async (done) => {
  await request(app).post('/sign-in')
    .send({ usernameFromFront: "", passwordFromFront: "" })
    .expect(200)
    .expect({ result: false, user: null, error: ['champs vides'], token: null });
  done();
});



// tests Whishlist :
test("users Wishlist - Body correct", async (done) => {
  await request(app).get('/wishlist')
    .query({ token: 'sWJxSP13ZBZEtBWzjSC4neJkBKuU080j' })
    .expect(200)
    .expect({
      portofolios: {
        portofoliosId: [{
          _id: '60a0cf7ca76f131702edd22f',
          name: 'ADM Risk Parity',
          description1: 'ADM est une stratégie de momentum. C’est à dire qu’elle se base sur l’évolution des prix sur les derniers mois pour définir quel est l’actif sur lequel investir : Celui qui a le profil d’évolution des prix le plus favorable. Mais la stratégie défini aussi de manière mathématique à quel moment il faut vendre son exposition aux actions pour se réfugier dans un actif beaucoup plus sûr : Les obligations d’Etats.',
          description2: 'ADM calcul son signal en compilant l’évolution des prix sur 1 mois, 3 mois et 6 mois de 2 actifs :      ', description3: 'Les actions de grandes capitalisations US (répartie en Growth et value)',
          description4: 'Les actions de moyennes capitalisations US (répartie en Growth et value)',
          description5: 'Les actions de petites capitalisations US (répartie en Growth et value)',
          description6: 'Le signal ADM vous fait investir sur l’actif qui a été le plus performant selon le résultat ci-dessus. Si les deux actifs ont un momentum compilé négatif, ADM vous fait basculer sur le 3ème actif : le CASH.',
          description7: 'Le CASH est remplacé par des obligations d’Etats, ce qui a permis une bonne performance dans un environnement de baisse des taux généralisés ces dernières années.',
          description8: 'Le signal ADM est calculé à chaque fin de mois. Il demande donc un rééquilibrage potentiel de votre portefeuille chaque mois.',
          strategy: 'active',
          risk: 'audacieux',
          actifs: [
            { ticker: "SPY", repartition: 0, description: "ETF MSCI World (URTH)", type: "action" },
            { ticker: "QQQ", repartition: 0, description: "ETF Large Cap Growth", type: "action" },
            { ticker: "VTV", repartition: 0, description: "ETF Large Cap Value", type: "action" },
            { ticker: "IJH", repartition: 0, description: "ETF Mid Cap Growth", type: "action" },
            { ticker: "VOE", repartition: 0, description: "ETF Mid Cap Value", type: "action" },
            { ticker: "VIOG", repartition: 0, description: "ETF Small Cap Growth", type: "action" },
            { ticker: "VIOV", repartition: 100, description: "ETF Small Cap Value", type: "action" },
            { ticker: "TLT", repartition: 0, description: "ETF Bonds Long term US 20+ ", type: "obligation" }],
          perf1: '49,33 %',
          perf2: '63,94 %',
          perf5: '125,98 %',
          perfmax: '102,56 %',
          maxloss: '33,47 %',
          volatility: '17,67 %',
          selectBS: [{ ticker: "VIOV", repartition: "100", description: "ETF Small Cap Value", type: "action", action: "Acheter" }]
        }],
        _id: '60acf26f4befa00015da7f9d',
        username: 'Test',
        password: '$2b$10$NzKihMRtlZVtdIjtZqQJwurNghxuewZ6eG8OG1la8D4I/K0uqjJ.6',
        token: 'sWJxSP13ZBZEtBWzjSC4neJkBKuU080j',
        __v: 11
      },
      result: true,
      username: 'Test'
    });
  done();
});

test("users Wishlist - Body incomplet", async (done) => {
  await request(app).get('/wishlist')
    .query({ token: "" })
    .expect(200)
    .expect({ result: false, portofolios: "Aucun portefeuille enregistré" });
  done();
});



// tests Strategy :
test("users Strategy - Body correct", async (done) => {
  await request(app).post('/strategy')
    .send({ strategy: "active" })
    .expect(200)
    .expect({ profilName: ['Accelerated Dual Momentum', 'ADM Plus', 'ADM Risk Parity'] });
  done();
});

test("users Strategy - Body correct", async (done) => {
  await request(app).post('/strategy')
    .send({ strategy: "passive" })
    .expect(200)
    .expect({ profilName: ['60/40', "Permanent Portofolio", "All Weather"] });
  done();
});

test("users Strategy - Body incomplet", async (done) => {
  await request(app).post('/strategy')
    .send({ strategy: "" })
    .expect(200)
    .expect({ profilName: [] });
  done();
});

test("users Strategy - Body incomplet", async (done) => {
  await request(app).post('/strategy')
    .send({ name: 1234 })
    .expect(200)
    .expect({ profilName: [] });
  done();
});



// tests Portofolio :
test("users Portofolio - Body correct", async (done) => {
  await request(app).get('/portofolio')
    .query({ name: "60/40" })
    .expect(200)
    .expect({
      portofolios: {
        _id: '609fab40d98577c114588728',
        name: '60/40',
        description1: 'La méthode d’investissement 60/40 tire son nom directement de son allocation d’actif :',
        description2: ' • 60% du portefeuille est investi sur des actions',
        description3: ' • 40% du portefeuille est investi sur des obligations',
        description5: "Il est préférable de sélectionner des obligations de grande qualité : Obligation d’états US ou d'Europe de notation très élevée et d’échéances variées.",
        description6: 'L’allocation 60/40 est l’exemple parfait de l’efficacité d’une méthode simple. Son objectif est avant tout de réduire la volatilité de votre portefeuille en apportant une performance régulière année après année.',
        description7: ' Elle n’a pas vocation à battre le marché. Par défaut, 60/40 est rééquilibré une fois par an. ',
        description8: 'Par sa simplicité et son efficacité, l’allocation 60/40 est très souvent utilisée comme Benchmark d’allocations d’actifs.',
        strategy: 'passive',
        risk: 'audacieux',
        actifs: [{ ticker: "SPY", repartition: 60, description: "ETF MSCI World (URTH)", type: "action" }, { ticker: "TLT", repartition: 40, description: "ETF Bonds Long term US 20+ ", type: "obligation" }],
        perf1: '18,96 %',
        perf2: '17,83 %',
        perf5: '41,55 %',
        perfmax: '111,15 %',
        maxloss: '22,23 %',
        volatility: '10,13 %',
        selectBS: [{ ticker: "VIOV" }]
      }
    });
  done();
});

test("users Portofolio - Body incomplet", async (done) => {
  await request(app).get('/portofolio')
    .query({ name: "" })
    .expect(200)
    .expect({ portofolios: "Aucun portefeuille disponible" });
  done();
});

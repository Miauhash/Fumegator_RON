// lib/gameConfig.js (ARQUIVO NOVO)

const gameConfig = {
    general: { minWithdraw: 10 },
    productionRates: {
        ASA: 0.1, APAP: 0.1, IBU: 0.1, AMOX: 0.1, CIPRO: 0.1,
        MET: 0.05, LEV: 0.05, AZI: 0.05, DOX: 0.05, VANC: 0.05,
        FUR: 0.02, HCTZ: 0.02, LIS: 0.02, ATOR: 0.02, SIM: 0.02,
        OMEP: 0.01, RAB: 0.01, ESOM: 0.01, PANT: 0.01, DEX: 0.01,
        INS: 0.005, GLI: 0.005, SITA: 0.005, PIO: 0.005, EMP: 0.005,
    },
    progression: {
        minTime: 60,
        maxTime: 432000,
        minReward: 0.001,
        maxReward: 24,
        maxLevel: 250,
    },
};

export default gameConfig;
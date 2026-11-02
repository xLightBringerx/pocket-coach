const CM_PER_INCH = 2.54;
const KG_PER_LB = 0.45359237;

// Round to one decimal place, e.g. 177.8
const round1 = (n) => Math.round(n * 10) / 10;

// 5 ft 10 in -> 177.8 cm
function feetInchesToCm(feet, inches = 0) {
  return round1((feet * 12 + inches) * CM_PER_INCH);
}

// 177.8 cm -> { feet: 5, inches: 10 }
function cmToFeetInches(cm) {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

// 180 lbs -> 81.6 kg
function lbsToKg(lbs) {
  return round1(lbs * KG_PER_LB);
}

// 81.6 kg -> 180 lbs
function kgToLbs(kg) {
  return Math.round(kg / KG_PER_LB);
}

module.exports = { feetInchesToCm, cmToFeetInches, lbsToKg, kgToLbs };
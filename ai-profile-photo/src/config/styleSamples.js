/**
 * 프로필 타입별 스타일 변형 샘플 이미지
 * 여성/남성 번갈아 배치 — 총 12장
 */

// SNS — Female
import snsF1 from '../assets/images/samples/sns/female/warm-golden.jpg'
import snsF2 from '../assets/images/samples/sns/female/cafe.jpg'
import snsF3 from '../assets/images/samples/sns/female/natural-outdoor.jpg'
import snsF4 from '../assets/images/samples/sns/female/selfie-light.jpg'
import snsF5 from '../assets/images/samples/sns/female/soft-pastel.jpg'
import snsF6 from '../assets/images/samples/sns/female/urban-street.jpg'
// SNS — Male
import snsM1 from '../assets/images/samples/sns/male/warm-golden.jpg'
import snsM2 from '../assets/images/samples/sns/male/cafe-m.jpg'
import snsM3 from '../assets/images/samples/sns/male/natural-outdoor.jpg'
import snsM4 from '../assets/images/samples/sns/male/selfie-light-m.jpg'
import snsM5 from '../assets/images/samples/sns/male/soft-pastel-m.jpg'
import snsM6 from '../assets/images/samples/sns/male/urban-street-m.jpg'

// Professional — Female
import proF1 from '../assets/images/samples/professional/female/warm-golden.jpg'
import proF2 from '../assets/images/samples/professional/female/cool-studio.jpg'
import proF3 from '../assets/images/samples/professional/female/natural-outdoor.jpg'
import proF4 from '../assets/images/samples/professional/female/doctor.jpg'
import proF5 from '../assets/images/samples/professional/female/soft-pastel.jpg'
import proF6 from '../assets/images/samples/professional/female/urban-street.jpg'
// Professional — Male
import proM1 from '../assets/images/samples/professional/male/warm-golden-m.jpg'
import proM2 from '../assets/images/samples/professional/male/cool-studio-m.jpg'
import proM3 from '../assets/images/samples/professional/male/natural-outdoor-m.jpg'
import proM4 from '../assets/images/samples/professional/male/doctor.jpg'
import proM5 from '../assets/images/samples/professional/male/soft-pastel-m.jpg'
import proM6 from '../assets/images/samples/professional/male/urban-street-m.jpg'

// Artist — Female
import artF1 from '../assets/images/samples/artist/female/warm-golden.jpg'
import artF2 from '../assets/images/samples/artist/female/gallery.jpg'
import artF3 from '../assets/images/samples/artist/female/natural-outdoor.jpg'
import artF4 from '../assets/images/samples/artist/female/vintage-film.jpg'
import artF5 from '../assets/images/samples/artist/female/soft-pastel.jpg'
import artF6 from '../assets/images/samples/artist/female/urban-street.jpg'
// Artist — Male
import artM1 from '../assets/images/samples/artist/male/warm-golden-m.jpg'
import artM2 from '../assets/images/samples/artist/male/gallery-m.jpg'
import artM3 from '../assets/images/samples/artist/male/natural-outdoor-m.jpg'
import artM4 from '../assets/images/samples/artist/male/vintage-film-m.jpg'
import artM5 from '../assets/images/samples/artist/male/soft-pastel-m.jpg'
import artM6 from '../assets/images/samples/artist/male/urban-street-m.jpg'

// Dating — Female
import datF1 from '../assets/images/samples/dating/female/warm-golden.jpg'
import datF2 from '../assets/images/samples/dating/female/cool-studio.jpg'
import datF3 from '../assets/images/samples/dating/female/natural-outdoor.jpg'
import datF4 from '../assets/images/samples/dating/female/spring-walk.jpg'
import datF5 from '../assets/images/samples/dating/female/soft-pastel.jpg'
import datF6 from '../assets/images/samples/dating/female/urban-street.jpg'
// Dating — Male
import datM1 from '../assets/images/samples/dating/male/warm-golden-m.jpg'
import datM2 from '../assets/images/samples/dating/male/cool-studio-m.jpg'
import datM3 from '../assets/images/samples/dating/male/natural-outdoor-m.jpg'
import datM4 from '../assets/images/samples/dating/male/spring-walk-m.jpg'
import datM5 from '../assets/images/samples/dating/male/soft-pastel-m.jpg'
import datM6 from '../assets/images/samples/dating/male/urban-street-m.jpg'

// Nomad — Female
import nomF1 from '../assets/images/samples/nomad/female/warm-golden.jpg'
import nomF2 from '../assets/images/samples/nomad/female/cool-studio.jpg'
import nomF3 from '../assets/images/samples/nomad/female/natural-outdoor.jpg'
import nomF4 from '../assets/images/samples/nomad/female/elegant-dark.jpg'
import nomF5 from '../assets/images/samples/nomad/female/soft-pastel.jpg'
import nomF6 from '../assets/images/samples/nomad/female/urban-street.jpg'
// Nomad — Male
import nomM1 from '../assets/images/samples/nomad/male/warm-golden-m.jpg'
import nomM2 from '../assets/images/samples/nomad/male/warm-golden-m.jpg' // cool-studio-m 누락, warm-golden 대체
import nomM3 from '../assets/images/samples/nomad/male/natural-outdoor-m.jpg'
import nomM4 from '../assets/images/samples/nomad/male/elegant-dark-m.jpg'
import nomM5 from '../assets/images/samples/nomad/male/soft-pastel-m.jpg'
import nomM6 from '../assets/images/samples/nomad/male/urban-street-m.jpg'

// Creative — Female
import creF1 from '../assets/images/samples/creative/female/figure.jpg'
import creF2 from '../assets/images/samples/creative/female/3d-character.jpg'
import creF3 from '../assets/images/samples/creative/female/vogue.jpg'
import creF4 from '../assets/images/samples/creative/female/hanbok.jpg'
import creF5 from '../assets/images/samples/creative/female/clay.jpg'
import creF6 from '../assets/images/samples/creative/female/goddess.jpg'
// Creative — Male
import creM1 from '../assets/images/samples/creative/male/figure-m.jpg'
import creM2 from '../assets/images/samples/creative/male/3d-character-m.jpg'
import creM3 from '../assets/images/samples/creative/male/vogue-m.jpg'
import creM4 from '../assets/images/samples/creative/male/hanbok-m.jpg'
import creM5 from '../assets/images/samples/creative/male/clay-m.jpg'
import creM6 from '../assets/images/samples/creative/male/goddess-m.jpg'

/** 여성/남성 번갈아 배치하여 12장 배열 생성 */
function interleave(female, male) {
  return female.map((f, i) => [f, male[i]]).flat();
}

export const STYLE_SAMPLES = {
  sns: interleave(
    [snsF1, snsF2, snsF3, snsF4, snsF5, snsF6],
    [snsM1, snsM2, snsM3, snsM4, snsM5, snsM6],
  ).map((url, i) => ({ id: `sns-${i}`, sampleUrl: url })),

  professional: interleave(
    [proF1, proF2, proF3, proF4, proF5, proF6],
    [proM1, proM2, proM3, proM4, proM5, proM6],
  ).map((url, i) => ({ id: `pro-${i}`, sampleUrl: url })),

  artist: interleave(
    [artF1, artF2, artF3, artF4, artF5, artF6],
    [artM1, artM2, artM3, artM4, artM5, artM6],
  ).map((url, i) => ({ id: `art-${i}`, sampleUrl: url })),

  dating: interleave(
    [datF1, datF2, datF3, datF4, datF5, datF6],
    [datM1, datM2, datM3, datM4, datM5, datM6],
  ).map((url, i) => ({ id: `dat-${i}`, sampleUrl: url })),

  nomad: interleave(
    [nomF1, nomF2, nomF3, nomF4, nomF5, nomF6],
    [nomM1, nomM2, nomM3, nomM4, nomM5, nomM6],
  ).map((url, i) => ({ id: `nom-${i}`, sampleUrl: url })),

  creative: interleave(
    [creF1, creF2, creF3, creF4, creF5, creF6],
    [creM1, creM2, creM3, creM4, creM5, creM6],
  ).map((url, i) => ({ id: `cre-${i}`, sampleUrl: url })),
};

/** profileTypeId에 해당하는 샘플 목록 반환 */
export function getSamplesForType(profileTypeId) {
  return STYLE_SAMPLES[profileTypeId] || STYLE_SAMPLES.professional;
}

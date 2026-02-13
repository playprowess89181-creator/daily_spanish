'use client';

import React, { useState } from 'react';

interface WordMeaning {
  word: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
}

interface VerbConjugation {
  infinitive: string;
  pronunciation: string;
  tenses: {
    [tense: string]: {
      [pronoun: string]: string;
    };
  };
}

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  content: string;
}

const DigitalBooks = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordMeaning | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerb, setSelectedVerb] = useState<VerbConjugation | null>(null);

  // Sample books data
  const books: Book[] = [
    {
      id: 1,
      title: "El Pequeño Pueblo",
      author: "María García",
      cover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjNEY0NkU1Ii8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSI3MCIgeT0iMTIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkw0IDdWMTdIMjBWN0wxMiAyWk0xMiA0LjMzTDE4IDhWMTVINlY4TDEyIDQuMzNaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RWwgUGVxdWXDsW8gUHVlYmxvPC90ZXh0Pgo8L3N2Zz4=",
      content: "En una pequeña ciudad vivía una joven llamada Ana. Cada mañana, caminaba por las calles empedradas hacia el mercado local. Los vendedores gritaban sus ofertas mientras los compradores examinaban cuidadosamente las frutas y verduras frescas. Ana trabajaba como profesora en la escuela primaria del pueblo. Sus estudiantes la adoraban porque siempre tenía historias interesantes que contar durante los recreos. Los niños corrían por el patio mientras ella los observaba desde la ventana de su aula. Por las tardes, visitaba a su abuela, quien vivía en una casa antigua cerca de la plaza principal. Juntas preparaban la cena tradicional y hablaban sobre los acontecimientos del día. Su abuela siempre compartía su sabiduría y consejos valiosos con su nieta querida."
    },
    {
      id: 2,
      title: "Aventuras en Madrid",
      author: "Carlos Ruiz",
      cover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRUY0NDQ0Ii8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiNGNTk3MzEiLz4KPHN2ZyB4PSI3MCIgeT0iMTIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkwyIDdMMTIgMTJMMjIgN0wxMiAyWk0yIDEzTDEyIDE4TDIyIDEzVjE3TDEyIDIyTDIgMTdWMTNaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QXZlbnR1cmFzIGVuIE1hZHJpZDwvdGV4dD4KPC9zdmc+",
      content: "Madrid es una ciudad llena de vida y cultura. Los turistas caminan por las calles admirando la arquitectura histórica. En el Museo del Prado, las obras de arte famosas atraen a visitantes de todo el mundo. Los cafés tradicionales sirven churros con chocolate caliente. Por la noche, la ciudad se transforma con luces brillantes y música en vivo. Los restaurantes ofrecen tapas deliciosas y vino español. La gente baila flamenco en los bares típicos hasta altas horas de la madrugada."
    },
    {
      id: 3,
      title: "Cocina Española",
      author: "Isabel Fernández",
      cover: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMDU5NjY5Ii8+CjxyZWN0IHg9IjIwIiB5PSI0MCIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyMjAiIGZpbGw9IiMwRkJBOEMiLz4KPHN2ZyB4PSI3MCIgeT0iMTIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNOC4xIDEzLjM0TDIgMTQuNjdWMTZIMjJWMTQuNjdMMTUuOSAxMy4zNEwxNSAxMkgxN1Y5SDIwVjdIMTdWNUgxNVY3SDlWNUg3VjdINFY5SDdWMTJIOUw4LjEgMTMuMzRaIi8+Cjwvc3ZnPgo8dGV4dCB4PSIxMDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29jaW5hIEVzcGHDsW9sYTwvdGV4dD4KPC9zdmc+",
      content: "La cocina española es rica en sabores y tradiciones. La paella valenciana es uno de los platos más famosos del país. Se prepara con arroz, azafrán, pollo, conejo y verduras frescas. En Andalucía, el gazpacho es una sopa fría perfecta para el verano. Los ingredientes incluyen tomates, pepinos, pimientos y aceite de oliva. El jamón ibérico es considerado una delicatessen mundial. Se cura durante años en las montañas de España. Cada región tiene sus especialidades culinarias únicas que reflejan la historia y cultura local."
    }
  ];

  // Sample word meanings database
  const wordMeanings: { [key: string]: WordMeaning } = {
    'pequeña': {
      word: 'pequeña',
      meaning: 'small (feminine)',
      pronunciation: '/pe.ˈke.ɲa/',
      partOfSpeech: 'adjective'
    },
    'ciudad': {
      word: 'ciudad',
      meaning: 'city',
      pronunciation: '/θju.ˈðað/',
      partOfSpeech: 'noun'
    },
    'vivía': {
      word: 'vivía',
      meaning: 'lived (imperfect tense)',
      pronunciation: '/bi.ˈβi.a/',
      partOfSpeech: 'verb'
    },
    'joven': {
      word: 'joven',
      meaning: 'young person',
      pronunciation: '/ˈxo.βen/',
      partOfSpeech: 'noun/adjective'
    },
    'llamada': {
      word: 'llamada',
      meaning: 'called/named (feminine)',
      pronunciation: '/ʎa.ˈma.ða/',
      partOfSpeech: 'adjective'
    },
    'mañana': {
      word: 'mañana',
      meaning: 'morning',
      pronunciation: '/ma.ˈɲa.na/',
      partOfSpeech: 'noun'
    },
    'caminaba': {
      word: 'caminaba',
      meaning: 'walked (imperfect tense)',
      pronunciation: '/ka.mi.ˈna.βa/',
      partOfSpeech: 'verb'
    },
    'calles': {
      word: 'calles',
      meaning: 'streets',
      pronunciation: '/ˈka.ʎes/',
      partOfSpeech: 'noun'
    },
    'empedradas': {
      word: 'empedradas',
      meaning: 'cobblestone (feminine plural)',
      pronunciation: '/em.pe.ˈðra.ðas/',
      partOfSpeech: 'adjective'
    },
    'mercado': {
      word: 'mercado',
      meaning: 'market',
      pronunciation: '/mer.ˈka.ðo/',
      partOfSpeech: 'noun'
    },
    'local': {
      word: 'local',
      meaning: 'local',
      pronunciation: '/lo.ˈkal/',
      partOfSpeech: 'adjective'
    },
    'vendedores': {
      word: 'vendedores',
      meaning: 'vendors/sellers',
      pronunciation: '/ben.de.ˈðo.res/',
      partOfSpeech: 'noun'
    },
    'gritaban': {
      word: 'gritaban',
      meaning: 'shouted (imperfect tense)',
      pronunciation: '/gri.ˈta.βan/',
      partOfSpeech: 'verb'
    },
    'ofertas': {
      word: 'ofertas',
      meaning: 'offers',
      pronunciation: '/o.ˈfer.tas/',
      partOfSpeech: 'noun'
    },
    'compradores': {
      word: 'compradores',
      meaning: 'buyers',
      pronunciation: '/kom.pra.ˈðo.res/',
      partOfSpeech: 'noun'
    },
    'examinaban': {
      word: 'examinaban',
      meaning: 'examined (imperfect tense)',
      pronunciation: '/ek.sa.mi.ˈna.βan/',
      partOfSpeech: 'verb'
    },
    'cuidadosamente': {
      word: 'cuidadosamente',
      meaning: 'carefully',
      pronunciation: '/kwi.ða.ðo.sa.ˈmen.te/',
      partOfSpeech: 'adverb'
    },
    'frutas': {
      word: 'frutas',
      meaning: 'fruits',
      pronunciation: '/ˈfru.tas/',
      partOfSpeech: 'noun'
    },
    'verduras': {
      word: 'verduras',
      meaning: 'vegetables',
      pronunciation: '/ber.ˈðu.ras/',
      partOfSpeech: 'noun'
    },
    'frescas': {
      word: 'frescas',
      meaning: 'fresh (feminine plural)',
      pronunciation: '/ˈfres.kas/',
      partOfSpeech: 'adjective'
    },
    'trabajaba': {
      word: 'trabajaba',
      meaning: 'worked (imperfect tense)',
      pronunciation: '/tra.βa.ˈxa.βa/',
      partOfSpeech: 'verb'
    },
    'profesora': {
      word: 'profesora',
      meaning: 'teacher (feminine)',
      pronunciation: '/pro.fe.ˈso.ra/',
      partOfSpeech: 'noun'
    },
    'escuela': {
      word: 'escuela',
      meaning: 'school',
      pronunciation: '/es.ˈkwe.la/',
      partOfSpeech: 'noun'
    },
    'primaria': {
      word: 'primaria',
      meaning: 'primary',
      pronunciation: '/pri.ˈma.rja/',
      partOfSpeech: 'adjective'
    },
    'pueblo': {
      word: 'pueblo',
      meaning: 'town/village',
      pronunciation: '/ˈpwe.βlo/',
      partOfSpeech: 'noun'
    },
    'estudiantes': {
      word: 'estudiantes',
      meaning: 'students',
      pronunciation: '/es.tu.ˈðjan.tes/',
      partOfSpeech: 'noun'
    },
    'adoraban': {
      word: 'adoraban',
      meaning: 'adored (imperfect tense)',
      pronunciation: '/a.ðo.ˈra.βan/',
      partOfSpeech: 'verb'
    },
    'siempre': {
      word: 'siempre',
      meaning: 'always',
      pronunciation: '/ˈsjem.pre/',
      partOfSpeech: 'adverb'
    },
    'tenía': {
      word: 'tenía',
      meaning: 'had (imperfect tense)',
      pronunciation: '/te.ˈni.a/',
      partOfSpeech: 'verb'
    },
    'historias': {
      word: 'historias',
      meaning: 'stories',
      pronunciation: '/is.ˈto.rjas/',
      partOfSpeech: 'noun'
    },
    'interesantes': {
      word: 'interesantes',
      meaning: 'interesting',
      pronunciation: '/in.te.re.ˈsan.tes/',
      partOfSpeech: 'adjective'
    },
    'contar': {
      word: 'contar',
      meaning: 'to tell',
      pronunciation: '/kon.ˈtar/',
      partOfSpeech: 'verb'
    },
    'durante': {
      word: 'durante',
      meaning: 'during',
      pronunciation: '/du.ˈran.te/',
      partOfSpeech: 'preposition'
    },
    'recreos': {
      word: 'recreos',
      meaning: 'recess/breaks',
      pronunciation: '/re.ˈkre.os/',
      partOfSpeech: 'noun'
    },
    'niños': {
      word: 'niños',
      meaning: 'children',
      pronunciation: '/ˈni.ɲos/',
      partOfSpeech: 'noun'
    },
    'corrían': {
      word: 'corrían',
      meaning: 'ran (imperfect tense)',
      pronunciation: '/ko.ˈri.an/',
      partOfSpeech: 'verb'
    },
    'patio': {
      word: 'patio',
      meaning: 'courtyard',
      pronunciation: '/ˈpa.tjo/',
      partOfSpeech: 'noun'
    },
    'mientras': {
      word: 'mientras',
      meaning: 'while',
      pronunciation: '/ˈmjen.tras/',
      partOfSpeech: 'conjunction'
    },
    'observaba': {
      word: 'observaba',
      meaning: 'observed (imperfect tense)',
      pronunciation: '/ob.ser.ˈβa.βa/',
      partOfSpeech: 'verb'
    },
    'desde': {
      word: 'desde',
      meaning: 'from',
      pronunciation: '/ˈdes.de/',
      partOfSpeech: 'preposition'
    },
    'ventana': {
      word: 'ventana',
      meaning: 'window',
      pronunciation: '/ben.ˈta.na/',
      partOfSpeech: 'noun'
    },
    'aula': {
      word: 'aula',
      meaning: 'classroom',
      pronunciation: '/ˈaw.la/',
      partOfSpeech: 'noun'
    },
    'tardes': {
      word: 'tardes',
      meaning: 'afternoons',
      pronunciation: '/ˈtar.des/',
      partOfSpeech: 'noun'
    },
    'visitaba': {
      word: 'visitaba',
      meaning: 'visited (imperfect tense)',
      pronunciation: '/bi.si.ˈta.βa/',
      partOfSpeech: 'verb'
    },
    'abuela': {
      word: 'abuela',
      meaning: 'grandmother',
      pronunciation: '/a.ˈβwe.la/',
      partOfSpeech: 'noun'
    },
    'quien': {
      word: 'quien',
      meaning: 'who',
      pronunciation: '/ˈkjen/',
      partOfSpeech: 'pronoun'
    },
    'casa': {
      word: 'casa',
      meaning: 'house',
      pronunciation: '/ˈka.sa/',
      partOfSpeech: 'noun'
    },
    'antigua': {
      word: 'antigua',
      meaning: 'old/ancient (feminine)',
      pronunciation: '/an.ˈti.gwa/',
      partOfSpeech: 'adjective'
    },
    'cerca': {
      word: 'cerca',
      meaning: 'near',
      pronunciation: '/ˈθer.ka/',
      partOfSpeech: 'adverb'
    },
    'plaza': {
      word: 'plaza',
      meaning: 'square/plaza',
      pronunciation: '/ˈpla.θa/',
      partOfSpeech: 'noun'
    },
    'principal': {
      word: 'principal',
      meaning: 'main',
      pronunciation: '/prin.θi.ˈpal/',
      partOfSpeech: 'adjective'
    },
    'juntas': {
      word: 'juntas',
      meaning: 'together (feminine)',
      pronunciation: '/ˈxun.tas/',
      partOfSpeech: 'adverb'
    },
    'preparaban': {
      word: 'preparaban',
      meaning: 'prepared (imperfect tense)',
      pronunciation: '/pre.pa.ˈra.βan/',
      partOfSpeech: 'verb'
    },
    'cena': {
      word: 'cena',
      meaning: 'dinner',
      pronunciation: '/ˈθe.na/',
      partOfSpeech: 'noun'
    },
    'tradicional': {
      word: 'tradicional',
      meaning: 'traditional',
      pronunciation: '/tra.ði.θjo.ˈnal/',
      partOfSpeech: 'adjective'
    },
    'hablaban': {
      word: 'hablaban',
      meaning: 'talked (imperfect tense)',
      pronunciation: '/a.ˈβla.βan/',
      partOfSpeech: 'verb'
    },
    'sobre': {
      word: 'sobre',
      meaning: 'about',
      pronunciation: '/ˈso.βre/',
      partOfSpeech: 'preposition'
    },
    'acontecimientos': {
      word: 'acontecimientos',
      meaning: 'events',
      pronunciation: '/a.kon.te.θi.ˈmjen.tos/',
      partOfSpeech: 'noun'
    },
    'día': {
      word: 'día',
      meaning: 'day',
      pronunciation: '/ˈdi.a/',
      partOfSpeech: 'noun'
    },
    'compartía': {
      word: 'compartía',
      meaning: 'shared (imperfect tense)',
      pronunciation: '/kom.par.ˈti.a/',
      partOfSpeech: 'verb'
    },
    'sabiduría': {
      word: 'sabiduría',
      meaning: 'wisdom',
      pronunciation: '/sa.βi.ðu.ˈri.a/',
      partOfSpeech: 'noun'
    },
    'consejos': {
      word: 'consejos',
      meaning: 'advice',
      pronunciation: '/kon.ˈse.xos/',
      partOfSpeech: 'noun'
    },
    'valiosos': {
      word: 'valiosos',
      meaning: 'valuable',
      pronunciation: '/ba.ˈljo.sos/',
      partOfSpeech: 'adjective'
    },
    'nieta': {
      word: 'nieta',
      meaning: 'granddaughter',
      pronunciation: '/ˈnje.ta/',
      partOfSpeech: 'noun'
    },
    'querida': {
      word: 'querida',
      meaning: 'beloved (feminine)',
      pronunciation: '/ke.ˈri.ða/',
      partOfSpeech: 'adjective'
    },
    // Madrid book words
    'madrid': {
      word: 'madrid',
      meaning: 'Madrid (capital of Spain)',
      pronunciation: '/ma.ˈðrið/',
      partOfSpeech: 'proper noun'
    },
    'llena': {
      word: 'llena',
      meaning: 'full (feminine)',
      pronunciation: '/ˈʎe.na/',
      partOfSpeech: 'adjective'
    },
    'vida': {
      word: 'vida',
      meaning: 'life',
      pronunciation: '/ˈbi.ða/',
      partOfSpeech: 'noun'
    },
    'cultura': {
      word: 'cultura',
      meaning: 'culture',
      pronunciation: '/kul.ˈtu.ra/',
      partOfSpeech: 'noun'
    },
    'turistas': {
      word: 'turistas',
      meaning: 'tourists',
      pronunciation: '/tu.ˈris.tas/',
      partOfSpeech: 'noun'
    },
    'caminan': {
      word: 'caminan',
      meaning: 'walk (present tense)',
      pronunciation: '/ka.ˈmi.nan/',
      partOfSpeech: 'verb'
    },
    'admirando': {
      word: 'admirando',
      meaning: 'admiring',
      pronunciation: '/aðmi.ˈran.do/',
      partOfSpeech: 'verb'
    },
    'arquitectura': {
      word: 'arquitectura',
      meaning: 'architecture',
      pronunciation: '/ar.ki.tek.ˈtu.ra/',
      partOfSpeech: 'noun'
    },
    'histórica': {
      word: 'histórica',
      meaning: 'historic (feminine)',
      pronunciation: '/is.ˈto.ri.ka/',
      partOfSpeech: 'adjective'
    },
    'museo': {
      word: 'museo',
      meaning: 'museum',
      pronunciation: '/mu.ˈse.o/',
      partOfSpeech: 'noun'
    },
    'prado': {
      word: 'prado',
      meaning: 'Prado (museum name)',
      pronunciation: '/ˈpra.ðo/',
      partOfSpeech: 'proper noun'
    },
    'obras': {
      word: 'obras',
      meaning: 'works',
      pronunciation: '/ˈo.βras/',
      partOfSpeech: 'noun'
    },
    'arte': {
      word: 'arte',
      meaning: 'art',
      pronunciation: '/ˈar.te/',
      partOfSpeech: 'noun'
    },
    'famosas': {
      word: 'famosas',
      meaning: 'famous (feminine plural)',
      pronunciation: '/fa.ˈmo.sas/',
      partOfSpeech: 'adjective'
    },
    'atraen': {
      word: 'atraen',
      meaning: 'attract (present tense)',
      pronunciation: '/a.ˈtra.en/',
      partOfSpeech: 'verb'
    },
    'visitantes': {
      word: 'visitantes',
      meaning: 'visitors',
      pronunciation: '/bi.si.ˈtan.tes/',
      partOfSpeech: 'noun'
    },
    'todo': {
      word: 'todo',
      meaning: 'all',
      pronunciation: '/ˈto.ðo/',
      partOfSpeech: 'adjective'
    },
    'mundo': {
      word: 'mundo',
      meaning: 'world',
      pronunciation: '/ˈmun.do/',
      partOfSpeech: 'noun'
    },
    'cafés': {
      word: 'cafés',
      meaning: 'cafes',
      pronunciation: '/ka.ˈfes/',
      partOfSpeech: 'noun'
    },
    'tradicionales': {
      word: 'tradicionales',
      meaning: 'traditional (plural)',
      pronunciation: '/tra.ði.θjo.ˈna.les/',
      partOfSpeech: 'adjective'
    },
    'sirven': {
      word: 'sirven',
      meaning: 'serve (present tense)',
      pronunciation: '/ˈsir.βen/',
      partOfSpeech: 'verb'
    },
    'churros': {
      word: 'churros',
      meaning: 'churros (Spanish pastry)',
      pronunciation: '/ˈt͡ʃu.ros/',
      partOfSpeech: 'noun'
    },
    'chocolate': {
      word: 'chocolate',
      meaning: 'chocolate',
      pronunciation: '/t͡ʃo.ko.ˈla.te/',
      partOfSpeech: 'noun'
    },
    'caliente': {
      word: 'caliente',
      meaning: 'hot',
      pronunciation: '/ka.ˈljen.te/',
      partOfSpeech: 'adjective'
    },
    'noche': {
      word: 'noche',
      meaning: 'night',
      pronunciation: '/ˈno.t͡ʃe/',
      partOfSpeech: 'noun'
    },
    'transforma': {
      word: 'transforma',
      meaning: 'transforms',
      pronunciation: '/trans.ˈfor.ma/',
      partOfSpeech: 'verb'
    },
    'luces': {
      word: 'luces',
      meaning: 'lights',
      pronunciation: '/ˈlu.θes/',
      partOfSpeech: 'noun'
    },
    'brillantes': {
      word: 'brillantes',
      meaning: 'bright',
      pronunciation: '/bri.ˈʎan.tes/',
      partOfSpeech: 'adjective'
    },
    'música': {
      word: 'música',
      meaning: 'music',
      pronunciation: '/ˈmu.si.ka/',
      partOfSpeech: 'noun'
    },
    'vivo': {
      word: 'vivo',
      meaning: 'live',
      pronunciation: '/ˈbi.βo/',
      partOfSpeech: 'adjective'
    },
    'restaurantes': {
      word: 'restaurantes',
      meaning: 'restaurants',
      pronunciation: '/res.taw.ˈran.tes/',
      partOfSpeech: 'noun'
    },
    'ofrecen': {
      word: 'ofrecen',
      meaning: 'offer (present tense)',
      pronunciation: '/o.ˈfre.θen/',
      partOfSpeech: 'verb'
    },
    'tapas': {
      word: 'tapas',
      meaning: 'tapas (Spanish appetizers)',
      pronunciation: '/ˈta.pas/',
      partOfSpeech: 'noun'
    },
    'deliciosas': {
      word: 'deliciosas',
      meaning: 'delicious (feminine plural)',
      pronunciation: '/de.li.ˈθjo.sas/',
      partOfSpeech: 'adjective'
    },
    'vino': {
      word: 'vino',
      meaning: 'wine',
      pronunciation: '/ˈbi.no/',
      partOfSpeech: 'noun'
    },
    'español': {
      word: 'español',
      meaning: 'Spanish',
      pronunciation: '/es.pa.ˈɲol/',
      partOfSpeech: 'adjective'
    },
    'gente': {
      word: 'gente',
      meaning: 'people',
      pronunciation: '/ˈxen.te/',
      partOfSpeech: 'noun'
    },
    'baila': {
      word: 'baila',
      meaning: 'dances',
      pronunciation: '/ˈbaj.la/',
      partOfSpeech: 'verb'
    },
    'flamenco': {
      word: 'flamenco',
      meaning: 'flamenco (Spanish dance)',
      pronunciation: '/fla.ˈmen.ko/',
      partOfSpeech: 'noun'
    },
    'bares': {
      word: 'bares',
      meaning: 'bars',
      pronunciation: '/ˈba.res/',
      partOfSpeech: 'noun'
    },
    'típicos': {
      word: 'típicos',
      meaning: 'typical',
      pronunciation: '/ˈti.pi.kos/',
      partOfSpeech: 'adjective'
    },
    'hasta': {
      word: 'hasta',
      meaning: 'until',
      pronunciation: '/ˈas.ta/',
      partOfSpeech: 'preposition'
    },
    'altas': {
      word: 'altas',
      meaning: 'high (feminine plural)',
      pronunciation: '/ˈal.tas/',
      partOfSpeech: 'adjective'
    },
    'horas': {
      word: 'horas',
      meaning: 'hours',
      pronunciation: '/ˈo.ras/',
      partOfSpeech: 'noun'
    },
    'madrugada': {
      word: 'madrugada',
      meaning: 'early morning/dawn',
      pronunciation: '/ma.ðru.ˈga.ða/',
      partOfSpeech: 'noun'
    },
    // Cooking book words
    'cocina': {
      word: 'cocina',
      meaning: 'kitchen/cuisine',
      pronunciation: '/ko.ˈθi.na/',
      partOfSpeech: 'noun'
    },
    'española': {
      word: 'española',
      meaning: 'Spanish (feminine)',
      pronunciation: '/es.pa.ˈɲo.la/',
      partOfSpeech: 'adjective'
    },
    'rica': {
      word: 'rica',
      meaning: 'rich (feminine)',
      pronunciation: '/ˈri.ka/',
      partOfSpeech: 'adjective'
    },
    'sabores': {
      word: 'sabores',
      meaning: 'flavors',
      pronunciation: '/sa.ˈβo.res/',
      partOfSpeech: 'noun'
    },
    'tradiciones': {
      word: 'tradiciones',
      meaning: 'traditions',
      pronunciation: '/tra.ði.ˈθjo.nes/',
      partOfSpeech: 'noun'
    },
    'paella': {
      word: 'paella',
      meaning: 'paella (Spanish rice dish)',
      pronunciation: '/pa.ˈe.ʎa/',
      partOfSpeech: 'noun'
    },
    'valenciana': {
      word: 'valenciana',
      meaning: 'Valencian (from Valencia)',
      pronunciation: '/ba.len.ˈθja.na/',
      partOfSpeech: 'adjective'
    },
    'uno': {
      word: 'uno',
      meaning: 'one',
      pronunciation: '/ˈu.no/',
      partOfSpeech: 'number'
    },
    'platos': {
      word: 'platos',
      meaning: 'dishes',
      pronunciation: '/ˈpla.tos/',
      partOfSpeech: 'noun'
    },
    'más': {
      word: 'más',
      meaning: 'more',
      pronunciation: '/mas/',
      partOfSpeech: 'adverb'
    },
    'famosos': {
      word: 'famosos',
      meaning: 'famous (masculine plural)',
      pronunciation: '/fa.ˈmo.sos/',
      partOfSpeech: 'adjective'
    },
    'país': {
      word: 'país',
      meaning: 'country',
      pronunciation: '/pa.ˈis/',
      partOfSpeech: 'noun'
    },
    'prepara': {
      word: 'prepara',
      meaning: 'prepares',
      pronunciation: '/pre.ˈpa.ra/',
      partOfSpeech: 'verb'
    },
    'con': {
      word: 'con',
      meaning: 'with',
      pronunciation: '/kon/',
      partOfSpeech: 'preposition'
    },
    'arroz': {
      word: 'arroz',
      meaning: 'rice',
      pronunciation: '/a.ˈroθ/',
      partOfSpeech: 'noun'
    },
    'azafrán': {
      word: 'azafrán',
      meaning: 'saffron',
      pronunciation: '/a.θa.ˈfran/',
      partOfSpeech: 'noun'
    },
    'pollo': {
      word: 'pollo',
      meaning: 'chicken',
      pronunciation: '/ˈpo.ʎo/',
      partOfSpeech: 'noun'
    },
    'conejo': {
      word: 'conejo',
      meaning: 'rabbit',
      pronunciation: '/ko.ˈne.xo/',
      partOfSpeech: 'noun'
    },
    'andalucía': {
      word: 'andalucía',
      meaning: 'Andalusia (region in Spain)',
      pronunciation: '/an.da.lu.ˈθi.a/',
      partOfSpeech: 'proper noun'
    },
    'gazpacho': {
      word: 'gazpacho',
      meaning: 'gazpacho (cold soup)',
      pronunciation: '/gaθ.ˈpa.t͡ʃo/',
      partOfSpeech: 'noun'
    },
    'sopa': {
      word: 'sopa',
      meaning: 'soup',
      pronunciation: '/ˈso.pa/',
      partOfSpeech: 'noun'
    },
    'fría': {
      word: 'fría',
      meaning: 'cold (feminine)',
      pronunciation: '/ˈfri.a/',
      partOfSpeech: 'adjective'
    },
    'perfecta': {
      word: 'perfecta',
      meaning: 'perfect (feminine)',
      pronunciation: '/per.ˈfek.ta/',
      partOfSpeech: 'adjective'
    },
    'para': {
      word: 'para',
      meaning: 'for',
      pronunciation: '/ˈpa.ra/',
      partOfSpeech: 'preposition'
    },
    'verano': {
      word: 'verano',
      meaning: 'summer',
      pronunciation: '/be.ˈra.no/',
      partOfSpeech: 'noun'
    },
    'ingredientes': {
      word: 'ingredientes',
      meaning: 'ingredients',
      pronunciation: '/in.gre.ˈðjen.tes/',
      partOfSpeech: 'noun'
    },
    'incluyen': {
      word: 'incluyen',
      meaning: 'include',
      pronunciation: '/in.ˈklu.ʝen/',
      partOfSpeech: 'verb'
    },
    'tomates': {
      word: 'tomates',
      meaning: 'tomatoes',
      pronunciation: '/to.ˈma.tes/',
      partOfSpeech: 'noun'
    },
    'pepinos': {
      word: 'pepinos',
      meaning: 'cucumbers',
      pronunciation: '/pe.ˈpi.nos/',
      partOfSpeech: 'noun'
    },
    'pimientos': {
      word: 'pimientos',
      meaning: 'peppers',
      pronunciation: '/pi.ˈmjen.tos/',
      partOfSpeech: 'noun'
    },
    'aceite': {
      word: 'aceite',
      meaning: 'oil',
      pronunciation: '/a.ˈθej.te/',
      partOfSpeech: 'noun'
    },
    'oliva': {
      word: 'oliva',
      meaning: 'olive',
      pronunciation: '/o.ˈli.βa/',
      partOfSpeech: 'noun'
    },
    'jamón': {
      word: 'jamón',
      meaning: 'ham',
      pronunciation: '/xa.ˈmon/',
      partOfSpeech: 'noun'
    },
    'ibérico': {
      word: 'ibérico',
      meaning: 'Iberian',
      pronunciation: '/i.ˈβe.ri.ko/',
      partOfSpeech: 'adjective'
    },
    'considerado': {
      word: 'considerado',
      meaning: 'considered',
      pronunciation: '/kon.si.ðe.ˈra.ðo/',
      partOfSpeech: 'verb'
    },
    'una': {
      word: 'una',
      meaning: 'a/an (feminine)',
      pronunciation: '/ˈu.na/',
      partOfSpeech: 'article'
    },
    'delicatessen': {
      word: 'delicatessen',
      meaning: 'delicacy',
      pronunciation: '/de.li.ka.ˈte.sen/',
      partOfSpeech: 'noun'
    },
    'mundial': {
      word: 'mundial',
      meaning: 'worldwide',
      pronunciation: '/mun.ˈdjal/',
      partOfSpeech: 'adjective'
    },
    'cura': {
      word: 'cura',
      meaning: 'cures',
      pronunciation: '/ˈku.ra/',
      partOfSpeech: 'verb'
    },
    'años': {
      word: 'años',
      meaning: 'years',
      pronunciation: '/ˈa.ɲos/',
      partOfSpeech: 'noun'
    },
    'montañas': {
      word: 'montañas',
      meaning: 'mountains',
      pronunciation: '/mon.ˈta.ɲas/',
      partOfSpeech: 'noun'
    },
    'españa': {
      word: 'españa',
      meaning: 'Spain',
      pronunciation: '/es.ˈpa.ɲa/',
      partOfSpeech: 'proper noun'
    },
    'cada': {
      word: 'cada',
      meaning: 'each',
      pronunciation: '/ˈka.ða/',
      partOfSpeech: 'adjective'
    },
    'región': {
      word: 'región',
      meaning: 'region',
      pronunciation: '/re.ˈxjon/',
      partOfSpeech: 'noun'
    },
    'tiene': {
      word: 'tiene',
      meaning: 'has',
      pronunciation: '/ˈtje.ne/',
      partOfSpeech: 'verb'
    },
    'sus': {
      word: 'sus',
      meaning: 'their/his/her',
      pronunciation: '/sus/',
      partOfSpeech: 'possessive'
    },
    'especialidades': {
      word: 'especialidades',
      meaning: 'specialties',
      pronunciation: '/es.pe.θja.li.ˈða.ðes/',
      partOfSpeech: 'noun'
    },
    'culinarias': {
      word: 'culinarias',
      meaning: 'culinary (feminine plural)',
      pronunciation: '/ku.li.ˈna.rjas/',
      partOfSpeech: 'adjective'
    },
    'únicas': {
      word: 'únicas',
      meaning: 'unique (feminine plural)',
      pronunciation: '/ˈu.ni.kas/',
      partOfSpeech: 'adjective'
    },
    'que': {
      word: 'que',
      meaning: 'that',
      pronunciation: '/ke/',
      partOfSpeech: 'conjunction'
    },
    'reflejan': {
      word: 'reflejan',
      meaning: 'reflect',
      pronunciation: '/re.ˈfle.xan/',
      partOfSpeech: 'verb'
    },
    'historia': {
      word: 'historia',
      meaning: 'history',
      pronunciation: '/is.ˈto.rja/',
      partOfSpeech: 'noun'
    }
  };

  // Sample verb conjugations
  const verbConjugations: { [key: string]: VerbConjugation } = {
    'hablar': {
      infinitive: 'hablar',
      pronunciation: '/a.ˈβlar/',
      tenses: {
        'Present': {
          'yo': 'hablo',
          'tú': 'hablas',
          'él/ella/usted': 'habla',
          'nosotros': 'hablamos',
          'vosotros': 'habláis',
          'ellos/ellas/ustedes': 'hablan'
        },
        'Preterite': {
          'yo': 'hablé',
          'tú': 'hablaste',
          'él/ella/usted': 'habló',
          'nosotros': 'hablamos',
          'vosotros': 'hablasteis',
          'ellos/ellas/ustedes': 'hablaron'
        },
        'Imperfect': {
          'yo': 'hablaba',
          'tú': 'hablabas',
          'él/ella/usted': 'hablaba',
          'nosotros': 'hablábamos',
          'vosotros': 'hablabais',
          'ellos/ellas/ustedes': 'hablaban'
        }
      }
    },
    'comer': {
      infinitive: 'comer',
      pronunciation: '/ko.ˈmer/',
      tenses: {
        'Present': {
          'yo': 'como',
          'tú': 'comes',
          'él/ella/usted': 'come',
          'nosotros': 'comemos',
          'vosotros': 'coméis',
          'ellos/ellas/ustedes': 'comen'
        },
        'Preterite': {
          'yo': 'comí',
          'tú': 'comiste',
          'él/ella/usted': 'comió',
          'nosotros': 'comimos',
          'vosotros': 'comisteis',
          'ellos/ellas/ustedes': 'comieron'
        },
        'Imperfect': {
          'yo': 'comía',
          'tú': 'comías',
          'él/ella/usted': 'comía',
          'nosotros': 'comíamos',
          'vosotros': 'comíais',
          'ellos/ellas/ustedes': 'comían'
        }
      }
    },
    'vivir': {
      infinitive: 'vivir',
      pronunciation: '/bi.ˈβir/',
      tenses: {
        'Present': {
          'yo': 'vivo',
          'tú': 'vives',
          'él/ella/usted': 'vive',
          'nosotros': 'vivimos',
          'vosotros': 'vivís',
          'ellos/ellas/ustedes': 'viven'
        },
        'Preterite': {
          'yo': 'viví',
          'tú': 'viviste',
          'él/ella/usted': 'vivió',
          'nosotros': 'vivimos',
          'vosotros': 'vivisteis',
          'ellos/ellas/ustedes': 'vivieron'
        },
        'Imperfect': {
          'yo': 'vivía',
          'tú': 'vivías',
          'él/ella/usted': 'vivía',
          'nosotros': 'vivíamos',
          'vosotros': 'vivíais',
          'ellos/ellas/ustedes': 'vivían'
        }
      }
    }
  };

  const handleWordClick = (word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const wordData = wordMeanings[cleanWord];
    if (wordData) {
      setSelectedWord(wordData);
    }
  };

  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      speechSynthesis.speak(utterance);
    }
  };

  const renderClickableText = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => (
      <span key={index}>
        <span
          className="cursor-pointer hover:bg-yellow-200 transition-colors duration-200"
          onClick={() => handleWordClick(word)}
        >
          {word}
        </span>
        {index < words.length - 1 && ' '}
      </span>
    ));
  };

  const BookPage = ({ book }: { book: Book }) => (
    <div className="max-w-4xl mx-auto p-6 relative">
      <button
        onClick={() => setSelectedBook(null)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </button>
      
      <div className="bg-white rounded-lg shadow-lg p-8 relative">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <img
            src={book.cover}
            alt={book.title}
            className="w-48 h-72 object-cover rounded-lg shadow-md mx-auto md:mx-0"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
            <button
              onClick={() => playPronunciation(book.title)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6z" />
              </svg>
              Play Title Pronunciation
            </button>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Story Content</h2>
          <div className="text-lg leading-relaxed text-gray-700 bg-gray-50 p-6 rounded-lg">
            {renderClickableText(book.content)}
          </div>
          <p className="text-sm text-gray-500 mt-4 italic">
            Click on any word to see its meaning and pronunciation!
          </p>
        </div>
      </div>

      {/* Word Meaning Modal - Now included in BookPage */}
      {selectedWord && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedWord.word}</h3>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Meaning:</span>
                <p className="text-gray-800">{selectedWord.meaning}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Part of Speech:</span>
                <p className="text-gray-800">{selectedWord.partOfSpeech}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Pronunciation:</span>
                <div className="flex items-center gap-2">
                  <p className="text-gray-800">{selectedWord.pronunciation}</p>
                  <button
                    onClick={() => playPronunciation(selectedWord.word)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6z" />
                    </svg>
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const filteredVerbs = Object.entries(verbConjugations).filter(([verb]) =>
    verb.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedBook) {
    return <BookPage book={selectedBook} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Digital Books Library</h2>
      
      {/* Books Library */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-gray-700">Book Collection</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200"
              onClick={() => setSelectedBook(book)}
            >
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{book.title}</h4>
                <p className="text-gray-600 mb-3">by {book.author}</p>
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  Read Book
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verb Conjugation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-semibold mb-6 text-gray-700">Verb Conjugation Practice</h3>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a verb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredVerbs.map(([verb, conjugation]) => (
            <button
              key={verb}
              onClick={() => setSelectedVerb(conjugation)}
              className="p-3 bg-gray-100 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <div className="font-semibold text-gray-800">{verb}</div>
              <div className="text-sm text-gray-600">{conjugation.pronunciation}</div>
            </button>
          ))}
        </div>

        {selectedVerb && (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-800">
                {selectedVerb.infinitive}
              </h4>
              <button
                onClick={() => playPronunciation(selectedVerb.infinitive)}
                className="flex items-center bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6z" />
                </svg>
                Play
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(selectedVerb.tenses).map(([tense, conjugations]) => (
                <div key={tense} className="bg-white rounded-lg p-4">
                  <h5 className="font-semibold text-gray-700 mb-3">{tense}</h5>
                  <div className="space-y-2">
                    {Object.entries(conjugations).map(([pronoun, form]) => (
                      <div key={pronoun} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{pronoun}:</span>
                        <span className="font-medium text-gray-800">{form}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredVerbs.length === 0 && searchTerm && (
          <p className="text-gray-500 text-center py-8">
            No verbs found matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Word Meaning Modal */}
      {selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedWord.word}</h3>
              <button
                onClick={() => setSelectedWord(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Meaning:</span>
                <p className="text-gray-800">{selectedWord.meaning}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Part of Speech:</span>
                <p className="text-gray-800">{selectedWord.partOfSpeech}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-600">Pronunciation:</span>
                <div className="flex items-center gap-2">
                  <p className="text-gray-800">{selectedWord.pronunciation}</p>
                  <button
                    onClick={() => playPronunciation(selectedWord.word)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6z" />
                </svg>
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalBooks;
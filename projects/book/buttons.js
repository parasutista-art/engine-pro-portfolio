// DŮLEŽITÉ: Tento soubor musí být uložen v kódování UTF-8, aby se správně zobrazovala diakritika.

const buttonData = [
    // S3B 2
    {
        spread: 2,

        text: `S3B

        Triptych animovaných plakátů, který vizuálně interpretuje tři stavy studentského života: školní tlak, nemoc a volný čas. Každý stav je reprezentován symbolickým objektem a citátem doprovázenými simulací tiskové bitmapy a abstraktní deformací obrazu. Projekt byl záměrným experimentem s cílem naučit se základy motion designu, přičemž textura a bitmapa byly vytvořeny ve Photoshopu a animace a deformace v After Effects.`,
        styles: {
            top: '5%',
            left: '1%',
            width: '48%',
            height: '24%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/4isté rendery pohromadě 2-2.webm',
     
        styles: {
            // TOTO SI UPRAVTE:
            top: '33%',
            left: '2%', // (přes 50% = pravá stránka)
            width: '45%',
            height: '30%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/medium3_spread3.webm',
        styles: {
            // TOTO SI UPRAVTE:
            top: '1%',
            left: '50%', // (přes 50% = pravá stránka)
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/medium2_spread3.webm',
  
        styles: {
            // TOTO SI UPRAVTE:
            top: '70%',
            left: '250%',
            width: '40%',
            height: '25%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/4isté rendery pohromadě invert.webm',
        text: 'S pozdní fázi navrhování jsem zmítal o inverzy. Ač mi byla velmi vábivá, zůstal jsem u původního konceptu.',
        styles: {
            // TOTO SI UPRAVTE:
            top: '70%',
            left: '250%',
            width: '40%',
            height: '25%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/proces.webm',
        text: 'proces',
        styles: {
            // TOTO SI UPRAVTE:
            top: '70%',
            left: '250%',
            width: '40%',
            height: '25%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/skicas3b.webp',
        text: 'První skica s výběrem frází a prvními nástřely kompozice',
        styles: {
            // TOTO SI UPRAVTE:
            top: '70%',
            left: '250%',
            width: '40%',
            height: '25%'
        }
    },
    // =================================
    // 360 3
    {
        spread: 3,

        text: `360

        Myšlenku k tomuto projektu se staly práce studentů přípravných kurzů, jejichž různorodé přístupy, ať už jak pracují s uhlem nebo samotná perspektiva. I přes to že jsem studii perspektivy viděl a dělal nespočetněkrát, jsem po kolečku kolem stojanů začal vnímat víc, než jen baličák, uhel a iluzi. Právě jejich propojení jako celku pro mne vytvořilo hlubší význam.`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '22%'
        }
    },
    {
        spread: 3,
        mediaSrc: 'media/360-2_overlay.webm',
        styles: {
            top: '22%',
            left: '61%',
            width: '28%',
            height: '57%'
        }
    },
    {
        spread: 3,
        mediaSrc: 'media/360 plakat.webp',
        mediaControls: true,
        styles: {
            top: '43%',
            left: '0%',
            width: '27%',
            height: '56%'
        }
    },
    {
        spread: 3,
        mediaSrc: 'media/360 video.webm',
        mediaControls: true,
        styles: {
            top: '43%',
            left: '27%',
            width: '23%',
            height: '56%'
        }
    },
   
    // Piktogramy 4
    {
        spread: 4,

        text: ` Piktogramy pro školní web

        Navrhnout sadu piktogramů bylo součástí školního úkolu. Vycházel jsem ze svižných skic, které jsem následně upravil a převedl do digitální formy. Mé piktogramy byly vybrány jako nejzdařilejší a byl jsem osloven na dopracování kompletní sady cca 30ti značek pro školní web. Nastavil jsem si jasná pravidla, dle kterých jsem navrhnul celou sadu. Vycházím z jednotné tloušťky tahu, nedotažené linky a čáry převážně v úhlu 90° a 45°. Inspirovaly mne naše školní obory, čím se vyznačují a písmo Norms, se kterým pracujeme v rámci vizuálního stylu. Pro web jsem vytvořil variantu se zeleným nosičem, který pomáhá piktogramy zvýraznit.

To popravdě bylo docela hustý protože do té doby jsem nedělal na ničem oficiálním a natož takhle velkém. Byl to můj první projekt který byl number 1 priorita a dělal jsem na něm denně. Trvalo to dlouho, ale konzltování, deadliny a preasure byly hrozně dobrá zkušenost ale hlavně v tom že mi škola věří, nevím jak to napsat ale byla tam motivace toho že jsem si chtěl dokázat to že to dokážu udělat, a hlavně dobře. A popravdě se mi stále líbí :)

`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '22%'
        }
    },
    {
        spread: 4,
        mediaSrc: 'media/Kunstmuller_gif piktogramů_1.webm',
        styles: {
            top: '15%',
            left: '55%',
            width: '40%',
            height: '70%'
        }
    },
    {
        spread: 4,
        mediaSrc: 'media/Kreslicí plátno 343.webp',
        styles: {
            top: '31%',
            left: '3%',
            width: '44%',
            height: '23%'
        }
    },
    {
        spread: 4,
        mediaSrc: 'media/Kunstmuller_Hlavní plakát.webp',
        styles: {
            top: '31%',
            left: '250%',
            width: '44%',
            height: '23%'
        }
    },
    {
        spread: 4,
        mediaSrc: 'media/stránky.webm',
        styles: {
            top: '63%',
            left: '5%',
            width: '40%',
            height: '29%'
        }
    },
  
    // Povaleč 5
    {
        spread: 5,
        text: `Povaleč 

        Soutěžní návrh vizuální identity pro hudební festival Povaleč, vytvořený v týmu dvou během pěti dnů. Návrh postoupil do druhého finálového kola. Na základě soutěžní práce jsme byli osloveni ke spolupráci na tvorbě doprovodných festivalových grafik, což poskytlo cennou zkušenost s reálným projektem, prací v týmu a komunikací s klientem.`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '22%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/trojplakatpovaleci.webp',
        text: ``,
        styles: {
            top: '32%',
            left: '2%',
            width: '46%',
            height: '31%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/narakem.webp',
        text: ``,
        styles: {
            top: '66%',
            left: '2%',
            width: '46%',
            height: '4%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/Příspěvek Kurvy Češi s povalečákem.webp',
        text: ``,
        styles: {
            top: '70%',
            left: '2%',
            width: '18%',
            height: '26%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/povalecaci na tripu-ipraveno-3.webp',
        text: ``,
        styles: {
            top: '70%',
            left: '21%',
            width: '8%',
            height: '26%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/Ukzkavyuitplaktvatypickchrozmrech.webp',
        text: ``,
        styles: {
            top: '70%',
            left: '30%',
            width: '18%',
            height: '26%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/free-urban-posterwall-mockup.webp',
        text: ``,
        styles: {
            top: '70%',
            left: '250%',
            width: '18%',
            height: '26%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/NoFaceNoCase.webp',
        text: `ukázka insta-příspěvku z 19. ročníku`,
        styles: {
            top: '18%',
            left: '53%',
            width: '21%',
            height: '39%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/mapavalec.webp',
        text: `Mapa festivalu, byl extrémní pain ale nakonec tu práci vrátil a je to radost`,
        styles: {
            top: '18%',
            left: '77%',
            width: '18%',
            height: '39%'
        }
    },
    {
        spread: 5,
        mediaSrc: 'media/jen tytulka.webm',
        text: `Pozadí pro A stage mimo program`,
        styles: {
            top: '60%',
            left: '53%',
            width: '44%',
            height: '35%'
        }
    },
    // Tousťák 6
    {
        spread: 6,

        text: `Tousťák

        S kamarády z akce jsem jeli na výlet na špičák a během pomlouvání akcí se řešilo jak by vypadala ta naše ideální, a když jsme při tom jedli sváču tak jsme se spontálně shodli na tousťáku. Akce probíhá vývojem ale prozatím všechny 4 mělli originální plakát který sice není grafický skvost hoden oslav, ale je to srdcovka`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '15%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/Toustak plakat (1).webp',
        styles: {
            top: '37%',
            left: '0%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/poster noraml velikost.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/Toustak plakat (1).webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0346.webp',
        styles: {
            top: '1%',
            left: '50%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0627.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0633.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0656.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0785.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0838.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },
    {
        spread: 6,
        mediaSrc: 'media/DSC_0884.webp',
        styles: {
            top: '37%',
            left: '300%',
            width: '50%',
            height: '62%'
        }
    },

    // Busking a ztohoven 7
    {
        spread: 7,
        text: `Pilsen Busking fest

        `,
        styles: {
            top: '2%',
            left: '1%',
            width: '19%',
            height: '4%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/Celek_2.webm',
        styles: {
            top: '37%',
            left: '19%',
            width: '29%',
            height: '58%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/Bez názvu-2 copy.webp',
        styles: {
            top: '37%',
            left: '260%',
            width: '29%',
            height: '58%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/mapa.webp',
        styles: {
            top: '37%',
            left: '260%',
            width: '29%',
            height: '58%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/Tričko.webp',
        styles: {
            top: '37%',
            left: '260%',
            width: '29%',
            height: '58%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/plakatos ohniblijos 2.webp',
        styles: {
            top: '37%',
            left: '260%',
            width: '29%',
            height: '58%'
        }
    },
    {
        spread: 7,
        text: `Ztohoven

        `,
        styles: {
            top: '2%',
            left: '51%',
            width: '12%',
            height: '4%'
        }
    },
    {
        spread: 7,
        mediaSrc: 'media/ztohoven.webm',
        styles: {
            top: '15%',
            left: '55%',
            width: '40%',
            height: '70%'
        }
    },
    // typotrip 8
    {
        spread: 8,
        text: `Koncepční návrh vizuální identity pro třídní výstavu. Ve frustraci nepovedených návrhů jsem se rozhodl pro použití fotografií divokého prostoru ve kterém se vystavovalo, a pro zvýraznění jeho charakteru jsem fotky upravil do silně neonových barev. Série fotografií mě bavila ale samotné fotografie na plakát nestačili a tak jsem se rozhodl pro prosákávání fotografií do loopu v motion posteru pro ukázání celého prostoru. `,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '28%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/!!!POUŽÍVANÝ LOOP s typo 2_1.webm',
            styles: {
            top: '1%',
            left: '59%',
            width: '41%',
            height: '98%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/Mockup jen fotky.webp',
        styles: {
            top: '58%',
            left: '5%',
            width: '41%',
            height: '36%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/333 tripotyp.webp',
        styles: {
            top: '58%',
            left: '255%',
            width: '41%',
            height: '36%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/DSC00062.webp',
        styles: {
            top: '58%',
            left: '255%',
            width: '41%',
            height: '36%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/DSC00067.webp',
        styles: {
            top: '58%',
            left: '255%',
            width: '41%',
            height: '36%'
        }
    },
    {
        spread: 8,
        mediaSrc: 'media/DSC00069.webp',
        styles: {
            top: '58%',
            left: '255%',
            width: '41%',
            height: '36%'
        }
    },
    // Blokkada 9
    {
        spread: 9,

        text: `Autorský variable font, jehož cílem bylo prozkoumat technické a kreativní možnosti proměnlivého písma. Jeho design vychází z geometrického gridu 3×8 a je charakteristický motivem dvojitých spojů. Font disponuje dvěma proměnnými osami, které ovládají výšku a tloušťku tahu. Projekt se vyvinul od skic na papíře až po finální zpracování v programu FontLab, kde byly definovány mastry a logika interpolace.`,
        styles: {
            top: '14%',
            left: '1%',
            width: '48%',
            height: '20%'
        }
    },
    // Autorská knížka 10

    // citismog 11
    {
        spread: 11,
        mediaSrc: 'media/showcase naživo.webm',
        mediaControls: true,
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/zvukový clean mock up.webm',
        mediaControls: true,
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/Zelená 0.webm',
        styles: {
            top: '1%',
            left: '50%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/Zelená 1.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/Zelená 2.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/Zelená 3.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/otevřeno 0.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/otevřeno 1.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/otevřeno 2.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },
    {
        spread: 11,
        mediaSrc: 'media/smog/otevřeno 3.webm',
        styles: {
            top: '1%',
            left: '350%',
            width: '50%',
            height: '98%'
        }
    },


    // 1.txt 12
    {
        spread: 12,

        text: `Otevřený projekt založený na spontánním sběru scenů pomocí ručního skeneru. Během každodenního pohybu v prostoru skenuji povrchy a materiály, které mě vizuálně zaujmou. Výsledné skeny jsou prezentovány jako abstraktní textury zbavené původního kontextu, čímž je kladen důraz na jejich samostatný vizuální potenciál.`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '20%'
        }
    },
];
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
        mediaSrc: 'media/360 video.webm',
        mediaControls: true,
        styles: {
            top: '22%',
            left: '261%',
            width: '28%',
            height: '57%'
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
        mediaSrc: 'media/medium2_spread4.webm',
        styles: {
            top: '38%',
            left: '11%',
            width: '28%',
            height: '24%'
        }
    },
    {
        spread: 4,
        mediaSrc: 'media/medium3_spread4.webm',
        styles: {
            top: '66%',
            left: '11%',
            width: '28%',
            height: '24%'
        }
    },
    // Povaleč 5
    {
        spread: 5,

        text: `Povaleč

        Na předmětu Španělštiny, který nemám rád, jsem seděl v lavici s Františkou Bolfovou. V touze zmizet mentálně z té hodiny jsme se bavili o všem jíném a jedno k nám přelítl open call na vizuální identitu festivalu, který nasdílela škola na facebook. Já byl jakože “škoda že jsme se o tom nedozvěděli dřív, za pět ní do deadlinu nic nestihnem”, a fany “VO CO?!”. Hej a lidi mi normálně zustavali ve škole do zavíračky každý den jen abychom to sesmolili za pět dní. Nikdy jsme to nedělali, učili se kvuli tomu ve photoshopu k tomu, a prostě krejzy že jsme do toho šli. A reálně se to vyplatilo, protože jsme se dostali do druhého kola do kterého jsme vypumpovali všechno co jsme měli ale prostě jsme to nikdy nedělali a tak jsme to, ač těsně, nevyhráli. Což byl smutek kvuli času, ale povaleč tým nás oslovil jestli bychom pro ně nechtěli dělat pomocne grafiky. A to byla ta nejlepší věc co se nám mohla stát. Koukli jsme do děje toho, jak to celé vzniká, naučili se toho mrdu, a hlavně si to užili přímo na festivalu. Byli jsme i ročník potom a ač jsme dělali to same cela ta komunita za to prostě stojí.

`,
        styles: {
            top: '6%',
            left: '1%',
            width: '48%',
            height: '22%'
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
        mediaSrc: 'media/medium5_spread6_1114653811.vimeo',
        styles: {
            top: '25%',
            left: '55%',
            width: '35%',
            height: '45%'
        }
    },

    // Busking a ztohoven 7

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

    // zatím dík a čau 11

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
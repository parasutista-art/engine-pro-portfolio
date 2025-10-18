// DŮLEŽITÉ: Tento soubor musí být uložen v kódování UTF-8, aby se správně zobrazovala diakritika.

const buttonData = [
    // Dvoustrana 2
    {
        spread: 2,

        text: `Triptych animovaných plakátů, který vizuálně interpretuje tři stavy studentského života: školní tlak, nemoc a volný čas. Každý stav je reprezentován symbolickým objektem a citátem doprovázenými simulací tiskové bitmapy a abstraktní deformací obrazu. Projekt byl záměrným experimentem s cílem naučit se základy motion designu, přičemž textura a bitmapa byly vytvořeny ve Photoshopu a animace a deformace v After Effects.`,
        styles: {
            top: '5%',
            left: '1%',
            width: '48%',
            height: '24%'
        }
    },
    {
        spread: 2,
        mediaSrc: 'media/medium4_spread3.jpg',
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
        text: 'detail',
        styles: {
            // TOTO SI UPRAVTE:
            top: '70%',
            left: '110%',
            width: '40%',
            height: '25%'
        }
    },
    // =================================

    // Dvoustrana 4
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
    // Dvoustrana 5: Pouze text
    {
        spread: 5,
        text: 'Tohle je jen krátká poznámka bez obrázku. Někdy stačí jen pár slov na zachycení myšlenky. Příliš žluťoučký kůň úpěl ďábelské ódy. Je důležité, aby byl tento soubor uložen ve správném kódování, jinak se česká diakritika nezobrazí správně.',
        styles: {
            top: '15%',
            left: '55%',
            width: '30%',
            height: '25%'
        }
    },
    // Dvoustrana 6
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
];
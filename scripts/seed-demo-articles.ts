/**
 * Seed d'articles d'exemple pour la recette.
 * Images : Unsplash (https://unsplash.com/license) — URLs publiques, sans upload Cloudinary.
 *
 * Répartition : 5 actualités, 3 formation, 8 tracteur, 8 arrosage, 8 énergie.
 * Auteurs répartis entre admins et contributeurs existants.
 *
 * Usage : npx tsx scripts/seed-demo-articles.ts
 */
import { PrismaClient, ArticleStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

/** Photo Unsplash redimensionnée pour une couverture article. */
function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=675&q=80`;
}

type DemoArticle = {
  slug: string;
  title: string;
  excerpt: string;
  categorySlug: "actualites" | "formation" | "tracteur" | "arrosage" | "energie";
  coverPhotoId: string;
  content: string;
  /** Index dans la liste des auteurs (après tri admin d'abord). */
  authorIndex: number;
  /** Jours dans le passé pour publishedAt. */
  daysAgo: number;
};

const ARTICLES: DemoArticle[] = [
  // ── Actualités (5) ──────────────────────────────────────────
  {
    slug: "demo-assemblee-generale-2026",
    title: "Assemblée générale 2026 : compte rendu et prochaines étapes",
    excerpt:
      "Retour sur l’AG annuelle : bilan des projets, budget et feuille de route pour la saison à venir.",
    categorySlug: "actualites",
    coverPhotoId: "photo-1511632765486-a01980e01a18",
    authorIndex: 0,
    daysAgo: 2,
    content: `
      <h2>Une AG riche en échanges</h2>
      <p>L’assemblée générale 2026 a réuni adhérents, partenaires et bénévoles autour du bilan de l’année écoulée. Les trois axes — rétrofit tracteur, arrosage ETp et chambre fraîche — ont été présentés avec des indicateurs concrets de terrain.</p>
      <h2>Décisions prises</h2>
      <p>Le budget prévisionnel a été adopté à l’unanimité. Un groupe de travail « documentation ouverte » a été créé pour accélérer la publication des dossiers techniques. Les dates des ateliers du printemps seront communiquées sous quinze jours.</p>
      <h2>Prochaine réunion</h2>
      <p>Le conseil d’administration se réunira début septembre pour valider le calendrier des essais et les besoins en matériel.</p>
    `.trim(),
  },
  {
    slug: "demo-porte-ouverte-petits-loups",
    title: "Journée portes ouvertes chez les Petits Loups Maraîchers",
    excerpt:
      "Visite du site pilote, démonstrations d’arrosage piloté et échanges avec l’équipe MEEED.",
    categorySlug: "actualites",
    coverPhotoId: "photo-1464226184884-fa280b87c399",
    authorIndex: 1,
    daysAgo: 8,
    content: `
      <h2>Au programme</h2>
      <p>Plus de soixante visiteurs ont découvert le dispositif d’arrosage automatique et les premiers composants du tracteur en rétrofit. Des stands pédagogiques permettaient de manipuler les capteurs météo et de visualiser le calcul d’ETp en direct.</p>
      <h2>Ce qu’on retient</h2>
      <p>L’intérêt pour les solutions « low-tech / high-impact » reste très fort auprès des maraîchers et des étudiants. Plusieurs demandes de stages et de partenariats ont été enregistrées.</p>
    `.trim(),
  },
  {
    slug: "demo-appel-benevoles-ete",
    title: "Appel à bénévoles pour les essais d’été",
    excerpt:
      "Besoin de renforts pour les mesures terrain, le montage électrique et la rédaction des fiches techniques.",
    categorySlug: "actualites",
    coverPhotoId: "photo-1529156069898-49953e39b3ac",
    authorIndex: 2,
    daysAgo: 14,
    content: `
      <h2>Missions proposées</h2>
      <p>Trois profils sont recherchés : électrotechnicien·ne pour le câblage basse tension, rédacteur·rice technique pour les notices, et bénévole polyvalent·e pour les relevés d’humidité et de température.</p>
      <h2>Comment participer</h2>
      <p>Écrivez-nous via la page contact en précisant vos disponibilités. Une demi-journée d’accueil est organisée chaque mercredi matin sur le site.</p>
    `.trim(),
  },
  {
    slug: "demo-partenariat-ecole-agronomie",
    title: "Partenariat avec une école d’agronomie",
    excerpt:
      "Convention signée pour accueillir deux stagiaires sur l’irrigation et la conservation post-récolte.",
    categorySlug: "actualites",
    coverPhotoId: "photo-1523240795612-9a054b0db644",
    authorIndex: 0,
    daysAgo: 21,
    content: `
      <h2>Objectifs pédagogiques</h2>
      <p>Les stagiaires contribueront à la calibration des coefficients culturaux et à la rédaction d’un protocole de suivi de la chambre fraîche adiabatique. Les résultats seront publiés sous licence ouverte.</p>
      <h2>Calendrier</h2>
      <p>Accueil prévu de septembre à décembre. Un tutorat croisé association / exploitation encadrera chaque mission.</p>
    `.trim(),
  },
  {
    slug: "demo-newsletter-juin",
    title: "Newsletter de juin : ce qu’il ne fallait pas manquer",
    excerpt:
      "Synthèse mensuelle : avancées projets, dates clés et ressources récemment mises en ligne.",
    categorySlug: "actualites",
    coverPhotoId: "photo-1486312338219-ce68d2c6f44d",
    authorIndex: 3,
    daysAgo: 28,
    content: `
      <h2>Les temps forts</h2>
      <p>Stabilisation du pilotage des vannes, premiers tours de roue du châssis rétrofité en atelier, et maquette numérique de la chambre adiabatique. La rubrique documents s’enrichit de deux fiches « démarrage rapide ».</p>
      <h2>À venir en juillet</h2>
      <p>Campagne de mesures comparatives arrosage manuel vs ETp, et atelier découverte batterie / motorisation pour le tracteur.</p>
    `.trim(),
  },

  // ── Formation (3) ───────────────────────────────────────────
  {
    slug: "demo-atelier-etp-debutants",
    title: "Atelier : comprendre l’ETp en une demi-journée",
    excerpt:
      "Formation pratique pour lire une station météo et ajuster un programme d’arrosage.",
    categorySlug: "formation",
    coverPhotoId: "photo-1416879595882-3373a0480b5b",
    authorIndex: 1,
    daysAgo: 5,
    content: `
      <h2>Public et prérequis</h2>
      <p>Destiné aux maraîchers et techniciens débutants. Aucune compétence en programmation n’est requise. Apportez simplement les données de votre dernière semaine d’irrigation si vous en avez.</p>
      <h2>Contenu</h2>
      <ul>
        <li>Principes de l’évapotranspiration potentielle</li>
        <li>Lecture des capteurs (T°, HR, vent, pluie)</li>
        <li>Exercice : corriger une base de temps d’arrosage</li>
      </ul>
      <h2>Prochaine session</h2>
      <p>Inscriptions ouvertes via la page contact. Places limitées à douze participants.</p>
    `.trim(),
  },
  {
    slug: "demo-formation-securite-bt",
    title: "Formation sécurité électrique basse tension",
    excerpt:
      "Gestes essentiels pour intervenir en sécurité sur les installations MEEED (automates, batteries, vannes).",
    categorySlug: "formation",
    coverPhotoId: "photo-1621905251189-08b45d6a269e",
    authorIndex: 0,
    daysAgo: 12,
    content: `
      <h2>Pourquoi cette formation</h2>
      <p>Les projets MEEED mêlent électronique, puissance et humidité. Une mauvaise manipulation peut endommager le matériel ou mettre en danger les opérateurs. Ce module rappelle les bases H0/B0 adaptées au contexte agricole.</p>
      <h2>Programme</h2>
      <p>Identification des risques, EPI, consignation simple, et check-list avant toute intervention sur l’automate ou le pack batterie du tracteur.</p>
    `.trim(),
  },
  {
    slug: "demo-atelier-documentation-ouverte",
    title: "Atelier documentation ouverte : publier ses retours d’expérience",
    excerpt:
      "Méthode pour rédiger une fiche technique claire et la partager sur le magazine MEEED.",
    categorySlug: "formation",
    coverPhotoId: "photo-1454165804606-c3d57bc86b40",
    authorIndex: 2,
    daysAgo: 19,
    content: `
      <h2>Objectifs</h2>
      <p>Apprendre à structurer un article (contexte, méthode, résultats, limites), choisir une image de couverture et rattacher un PDF. L’atelier s’appuie sur l’éditeur du back-office.</p>
      <h2>Livrable</h2>
      <p>Chaque participant repart avec un brouillon prêt à être relu par un admin avant publication.</p>
    `.trim(),
  },

  // ── Tracteur (8) ────────────────────────────────────────────
  {
    slug: "demo-choix-moteur-20cv",
    title: "Choix du moteur électrique pour un 20 CV rétrofité",
    excerpt:
      "Critères de dimensionnement : couple, régime, refroidissement et intégration au châssis.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1625246333195-78d9c38ad449",
    authorIndex: 0,
    daysAgo: 4,
    content: `
      <h2>Cahier des charges</h2>
      <p>Le moteur doit fournir un couple suffisant pour les outils maraîchers (bineuse, butteuse) sans surchauffe en usage intermittent. La plage de régime vise à conserver la boîte existante avec un minimum d’adaptateurs.</p>
      <h2>Pistes retenues</h2>
      <p>Deux références industrielles sont en cours d’évaluation. Les essais banc et les premiers tours de roue seront documentés dans un prochain article.</p>
    `.trim(),
  },
  {
    slug: "demo-batterie-pack-tracteur",
    title: "Pack batterie : architecture et sécurité",
    excerpt:
      "Organisation des modules, BMS, et emplacement sur le châssis pour un centre de gravité stable.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1593941707882-a5bba14938c7",
    authorIndex: 3,
    daysAgo: 11,
    content: `
      <h2>Contraintes terrain</h2>
      <p>Vibrations, poussière et variations de température imposent un coffret étanche et une ventilation contrôlée. Le BMS surveille chaque module et coupe en cas de dérive.</p>
      <h2>Autonomie cible</h2>
      <p>Objectif : une demi-journée de travaux légers entre deux charges, compatible avec une recharge nocturne sur installation photovoltaïque.</p>
    `.trim(),
  },
  {
    slug: "demo-essais-transmission-retrofit",
    title: "Premiers essais de transmission après rétrofit",
    excerpt:
      "Compte rendu des premiers tests de couple et de comportement à faible vitesse.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1574943320219-553eb213f72d",
    authorIndex: 1,
    daysAgo: 17,
    content: `
      <h2>Protocole</h2>
      <p>Mesures de courant, température moteur et sensation de conduite sur sol ferme puis en terre travaillée. Les réglages d’accélération progressive ont été affinés pour éviter les à-coups.</p>
      <h2>Suite</h2>
      <p>Prochaine étape : essai avec outil porté et validation du freinage d’urgence logiciel.</p>
    `.trim(),
  },
  {
    slug: "demo-adaptateur-boite-vitesse",
    title: "Adaptateur boîte de vitesses : usinage et tolérances",
    excerpt:
      "Comment coupler le moteur électrique à la boîte d’origine sans fragiliser l’arbre.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1504148455328-c376907d081c",
    authorIndex: 2,
    daysAgo: 22,
    content: `
      <h2>Contrainte mécanique</h2>
      <p>L’adaptateur doit transmettre le couple sans jeu excessif tout en absorbant les légers défauts d’alignement. Un usinage en acier traité a été privilégié pour la première série.</p>
      <h2>Contrôles</h2>
      <p>Chaque pièce est mesurée au pied à coulisse et testée à vide avant montage sur le châssis. Les plans seront publiés une fois la version validée.</p>
    `.trim(),
  },
  {
    slug: "demo-poste-recharge-atelier",
    title: "Poste de recharge atelier : dimensionnement simple",
    excerpt:
      "Puissance, protections et câblage pour recharger le pack batterie en toute sécurité.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1558618666-fcd25c85cd64",
    authorIndex: 0,
    daysAgo: 26,
    content: `
      <h2>Besoin</h2>
      <p>Une recharge nocturne complète doit rester compatible avec une installation agricole classique. Le chargeur est protégé contre les surintensités et les défauts d’isolement.</p>
      <h2>Mise en œuvre</h2>
      <p>Le schéma électrique et la check-list de mise sous tension seront joints en PDF dans un prochain document technique.</p>
    `.trim(),
  },
  {
    slug: "demo-cabine-ergonomie-conduite",
    title: "Ergonomie de conduite après conversion électrique",
    excerpt:
      "Pédale, manettes et retour d’effort : ce qui change pour le conducteur.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1492496913980-501348b61469",
    authorIndex: 1,
    daysAgo: 31,
    content: `
      <h2>Retour utilisateurs</h2>
      <p>Les premiers conducteurs soulignent le silence et la progressivité. La pédale d’accélérateur électronique a nécessité un réglage de courbe pour coller aux habitudes thermiques.</p>
      <h2>Améliorations prévues</h2>
      <p>Ajout d’un indicateur d’autonomie lisible au soleil et d’un mode « manœuvre » à très basse vitesse.</p>
    `.trim(),
  },
  {
    slug: "demo-outils-portes-compatibles",
    title: "Outils portés compatibles avec le rétrofit 20 CV",
    excerpt:
      "Liste indicative des outils maraîchers testés ou envisagés sur le châssis converti.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1560493676-04071c5f467b",
    authorIndex: 3,
    daysAgo: 35,
    content: `
      <h2>Périmètre</h2>
      <p>Bineuse, herse étrille légère et butteuse simple figurent en tête de liste. Les outils trop gourmands en puissance restent hors cible pour cette première version.</p>
      <h2>Méthode</h2>
      <p>Chaque outil est essayé sur sol préparé puis sur sol plus compact, avec relevé de courant et observation du patinage.</p>
    `.trim(),
  },
  {
    slug: "demo-journal-chantier-retrofit",
    title: "Journal de chantier : trois semaines de rétrofit",
    excerpt:
      "Chronique des étapes atelier, des aléas et des solutions trouvées en cours de route.",
    categorySlug: "tracteur",
    coverPhotoId: "photo-1471193945509-9ad0617afabf",
    authorIndex: 2,
    daysAgo: 40,
    content: `
      <h2>Semaine 1</h2>
      <p>Démontage du thermique, inventaire des pièces réutilisables, nettoyage du châssis.</p>
      <h2>Semaines 2 et 3</h2>
      <p>Pose des supports moteur, câblage puissance, premiers tests à vide. Deux retards liés à des délais fournisseur ont décalé le planning d’une semaine.</p>
    `.trim(),
  },

  // ── Arrosage (8) ────────────────────────────────────────────
  {
    slug: "demo-centrale-meteo-etp",
    title: "Centrale météo : brancher les données à l’ETp",
    excerpt:
      "De la station au calcul quotidien : capteurs utilisés et fréquence de rafraîchissement.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1592982537447-7440770cbfc9",
    authorIndex: 2,
    daysAgo: 3,
    content: `
      <h2>Chaîne de mesure</h2>
      <p>Température, humidité relative, rayonnement et pluie alimentent la formule d’ETp. Les valeurs sont agrégées chaque nuit pour corriger les bases de temps des vannes le lendemain.</p>
      <h2>Fiabilité</h2>
      <p>Un contrôle croisé avec les relevés manuels sur quinze jours a confirmé l’ordre de grandeur des corrections appliquées.</p>
    `.trim(),
  },
  {
    slug: "demo-pilotage-vannes-relais",
    title: "Pilotage des vannes par cartes relais",
    excerpt:
      "Schéma simple pour commander plusieurs secteurs d’irrigation depuis un automate accessible.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1563514227147-6d2ff665a6a0",
    authorIndex: 0,
    daysAgo: 9,
    content: `
      <h2>Architecture</h2>
      <p>L’automate pilote des relais qui ouvrent et ferment les électrovannes selon le programme corrigé par l’ETp. Les composants sont standards et remplaçables localement.</p>
      <h2>Retour d’usage</h2>
      <p>Sur le site pilote, la bascule manuelle / auto reste disponible pour les interventions d’urgence ou les orages non prévus par le modèle.</p>
    `.trim(),
  },
  {
    slug: "demo-bilan-eau-deux-semaines",
    title: "Bilan eau : deux semaines d’arrosage piloté",
    excerpt:
      "Comparaison indicative des volumes entre programme fixe et correction ETp.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1461354464878-ad92f492a5a0",
    authorIndex: 3,
    daysAgo: 16,
    content: `
      <h2>Méthode</h2>
      <p>Deux parcelles similaires ont été suivies : l’une en base de temps fixe, l’autre corrigée quotidiennement. Les compteurs d’eau et l’état des cultures ont été notés chaque soir.</p>
      <h2>Résultats préliminaires</h2>
      <p>Une baisse de consommation est observée sans stress hydrique visible. Ces chiffres seront consolidés sur un mois complet avant publication définitive.</p>
    `.trim(),
  },
  {
    slug: "demo-coefficients-culturaux",
    title: "Coefficients culturaux : caler l’ETp sur chaque culture",
    excerpt:
      "Comment adapter le facteur cultural pour salades, tomates et légumes-racines.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1416879595882-3373a0480b5b",
    authorIndex: 1,
    daysAgo: 20,
    content: `
      <h2>Principe</h2>
      <p>L’ETp de référence est multipliée par un coefficient lié au stade et à l’espèce. Un mauvais coefficient surestime ou sous-estime l’eau utile.</p>
      <h2>Approche MEEED</h2>
      <p>Des valeurs de départ issues de la littérature sont affinées avec les observations terrain et les tensiomètres posés sur le site pilote.</p>
    `.trim(),
  },
  {
    slug: "demo-gestion-pluie-effective",
    title: "Prise en compte de la pluie effective",
    excerpt:
      "Soustraire correctement la pluie utile pour éviter d’arroser après un orage.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1426604966848-d7adac402bff",
    authorIndex: 0,
    daysAgo: 24,
    content: `
      <h2>Enjeu</h2>
      <p>Toute la pluie mesurée n’atteint pas la zone racinaire. Un seuil minimal et un plafond d’efficacité évitent les corrections trop optimistes.</p>
      <h2>Règle retenue</h2>
      <p>En dessous d’un millimètre, la pluie est ignorée ; au-delà, une fraction est déduite du besoin du lendemain, plafonnée par culture.</p>
    `.trim(),
  },
  {
    slug: "demo-maintenance-electrovannes",
    title: "Maintenance des électrovannes en saison",
    excerpt:
      "Gestes simples pour limiter les fuites, les blocages et les faux positifs de l’automate.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1464226184884-fa280b87c399",
    authorIndex: 2,
    daysAgo: 29,
    content: `
      <h2>Contrôles hebdomadaires</h2>
      <p>Ouverture manuelle, écoute des claquements de bobine, vérification des joints et du filtre amont. Un journal papier reste utile en complément des logs logiciels.</p>
      <h2>Pièces de rechange</h2>
      <p>Tenir un stock minimal de membranes et de bobines du même calibre accélère les réparations en pleine saison.</p>
    `.trim(),
  },
  {
    slug: "demo-secteurs-irrigation-carte",
    title: "Cartographier les secteurs d’irrigation",
    excerpt:
      "Découper la ferme en zones homogènes pour un pilotage ETp plus juste.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1500382017468-9049fed747ef",
    authorIndex: 3,
    daysAgo: 33,
    content: `
      <h2>Pourquoi découper</h2>
      <p>Sol, exposition et culture diffèrent d’une planche à l’autre. Un seul programme global arrose trop ici et pas assez là.</p>
      <h2>Méthode</h2>
      <p>Chaque vanne correspond à un secteur documenté (surface, culture, débit nominal). La carte est affichée dans l’atelier pour les interventions d’urgence.</p>
    `.trim(),
  },
  {
    slug: "demo-alerte-fuite-debit",
    title: "Détecter une fuite grâce au débit anormal",
    excerpt:
      "Surveiller les volumes horaires pour repérer un tuyau percé ou une vanne coincée ouverte.",
    categorySlug: "arrosage",
    coverPhotoId: "photo-1542601906990-b4d3fb778b09",
    authorIndex: 1,
    daysAgo: 38,
    content: `
      <h2>Signal faible</h2>
      <p>Un débit hors plage pendant un créneau hors programme déclenche une alerte. L’opérateur vérifie ensuite sur le terrain avant de bloquer le secteur.</p>
      <h2>Limites</h2>
      <p>Les micro-fuites progressives restent difficiles à voir sans compteur précis. L’objectif est d’attraper les incidents majeurs rapidement.</p>
    `.trim(),
  },

  // ── Énergie (8) ─────────────────────────────────────────────
  {
    slug: "demo-principe-chambre-adiabatique",
    title: "Chambre fraîche adiabatique : le principe en clair",
    excerpt:
      "Comment l’évaporation permet de refroidir un local de stockage avec peu d’énergie.",
    categorySlug: "energie",
    coverPhotoId: "photo-1550989460-0adf9ea622e2",
    authorIndex: 1,
    daysAgo: 6,
    content: `
      <h2>Le besoin</h2>
      <p>Après récolte, les légumes exigent fraîcheur et humidité. Une chambre froide classique consomme beaucoup ; l’approche adiabatique vise un compromis adapté aux petites exploitations.</p>
      <h2>Fonctionnement</h2>
      <p>L’air traverse un média humide : l’évaporation abaisse la température. Un ventilateur basse consommation assure le renouvellement. Le suivi hygrothermique valide le dimensionnement.</p>
    `.trim(),
  },
  {
    slug: "demo-mesures-hygro-chambre",
    title: "Premières mesures hygrothermiques en chambre",
    excerpt:
      "Courbes de température et d’humidité relevées pendant une semaine d’essais.",
    categorySlug: "energie",
    coverPhotoId: "photo-1615811361523-6bd03d7748e7",
    authorIndex: 2,
    daysAgo: 13,
    content: `
      <h2>Dispositif</h2>
      <p>Trois sondes (entrée, milieu, sortie) enregistrent T° et HR toutes les quinze minutes. Les données sont croisées avec la météo extérieure pour estimer le gain de fraîcheur.</p>
      <h2>Observations</h2>
      <p>L’écart thermique est encourageant en période chaude et sèche. Les prochaines itérations porteront sur l’isolation et le débit d’air.</p>
    `.trim(),
  },
  {
    slug: "demo-choix-media-evaporatif",
    title: "Choix du média évaporatif",
    excerpt:
      "Comparatif sommaire entre panneaux cellulose, copeaux et textiles humides.",
    categorySlug: "energie",
    coverPhotoId: "photo-1523741543316-beb7fc7023d8",
    authorIndex: 0,
    daysAgo: 18,
    content: `
      <h2>Critères</h2>
      <p>Efficacité de refroidissement, facilité de nettoyage, coût et disponibilité locale. Le média doit rester humidifié sans saturations stagnantes.</p>
      <h2>Piste retenue</h2>
      <p>Un panneau cellulose standard a été choisi pour la maquette, avec option de bascule vers un matériau plus local si les performances se confirment.</p>
    `.trim(),
  },
  {
    slug: "demo-isolation-local-stockage",
    title: "Isoler le local de stockage sans surcoût",
    excerpt:
      "Matériaux et détails constructifs pour limiter les apports de chaleur estivale.",
    categorySlug: "energie",
    coverPhotoId: "photo-1504148455328-c376907d081c",
    authorIndex: 3,
    daysAgo: 23,
    content: `
      <h2>Priorités</h2>
      <p>Toiture, portes et ponts thermiques. Une isolation moyenne bien mise en œuvre bat souvent une isolation épaisse mal jointoyée.</p>
      <h2>Retours chantier</h2>
      <p>Des plaques isolantes recyclées et un joint de porte soigné ont déjà réduit les pics de température diurne dans le prototype.</p>
    `.trim(),
  },
  {
    slug: "demo-ventilateur-basse-conso",
    title: "Ventilateur basse consommation : débit vs watts",
    excerpt:
      "Trouver le débit d’air suffisant sans faire exploser la facture électrique.",
    categorySlug: "energie",
    coverPhotoId: "photo-1473341304170-971dccb5ac1e",
    authorIndex: 1,
    daysAgo: 27,
    content: `
      <h2>Mesure</h2>
      <p>Plusieurs vitesses ont été testées : au-delà d’un certain débit, le gain de fraîcheur stagne alors que la consommation augmente.</p>
      <h2>Réglage</h2>
      <p>Un mode jour / nuit module le débit selon l’écart intérieur-extérieur et l’humidité du média.</p>
    `.trim(),
  },
  {
    slug: "demo-qualite-legumes-stockes",
    title: "Qualité des légumes après une semaine en chambre",
    excerpt:
      "Observations visuelles et pertes de masse sur quelques lots témoins.",
    categorySlug: "energie",
    coverPhotoId: "photo-1540420773420-3366772f4999",
    authorIndex: 2,
    daysAgo: 32,
    content: `
      <h2>Protocole</h2>
      <p>Pesée à l’entrée et à la sortie, notation de la turgescence et des défauts. Comparaison avec un local non conditionné.</p>
      <h2>Premiers constats</h2>
      <p>Les pertes de masse sont réduites sur les lots sensibles (salades, jeunes pousses). Un suivi plus long confirmera la tendance.</p>
    `.trim(),
  },
  {
    slug: "demo-bilan-energetique-chambre",
    title: "Bilan énergétique indicatif de la chambre",
    excerpt:
      "Estimation des kWh consommés par kilogramme stocké sur une semaine type.",
    categorySlug: "energie",
    coverPhotoId: "photo-1497435334941-8c899ee9e8e9",
    authorIndex: 0,
    daysAgo: 36,
    content: `
      <h2>Périmètre</h2>
      <p>Compteur dédié sur ventilateur et pompe d’humidification. Hors éclairage atelier et hors engins de manutention.</p>
      <h2>Ordre de grandeur</h2>
      <p>Les premiers chiffres restent très inférieurs à une chambre froide classique pour le même volume utile, sous réserve d’une météo sèche favorable.</p>
    `.trim(),
  },
  {
    slug: "demo-entretien-saison-chambre",
    title: "Entretien saisonnier de la chambre adiabatique",
    excerpt:
      "Nettoyage du média, contrôle des sondes et préparation avant la haute saison.",
    categorySlug: "energie",
    coverPhotoId: "photo-1581578731548-c64695cc6952",
    authorIndex: 3,
    daysAgo: 42,
    content: `
      <h2>Check-list</h2>
      <ul>
        <li>Rinçage ou remplacement du média évaporatif</li>
        <li>Calibration rapide des sondes T° / HR</li>
        <li>Contrôle des joints de porte et des filtres</li>
      </ul>
      <h2>Fréquence</h2>
      <p>Un passage complet avant l’été, puis un contrôle léger chaque mois d’utilisation intensive.</p>
    `.trim(),
  },
];

function slugifyFallback(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

async function main() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  // Mettre les ADMIN en premier pour authorIndex 0 = admin principal
  users.sort((a, b) => {
    if (a.role === UserRole.ADMIN && b.role !== UserRole.ADMIN) return -1;
    if (a.role !== UserRole.ADMIN && b.role === UserRole.ADMIN) return 1;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  if (users.length === 0) {
    throw new Error("Aucun utilisateur. Lancez d’abord : npm run db:seed");
  }

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
  const projects = await prisma.project.findMany();
  // Prefer canonical project when several share a category (e.g. energie + ferme-solaire)
  const projectByCategorySlug = new Map(
    projects.map((project) => {
      const category = categories.find((c) => c.id === project.categoryId);
      return [category?.slug ?? project.slug, project] as const;
    }),
  );
  for (const project of projects) {
    if (project.slug === "tracteur" || project.slug === "arrosage" || project.slug === "energie") {
      const category = categories.find((c) => c.id === project.categoryId);
      if (category) projectByCategorySlug.set(category.slug, project);
    }
  }

  for (const slug of ["actualites", "formation", "tracteur", "arrosage", "energie"]) {
    if (!categoryBySlug.has(slug)) {
      throw new Error(`Catégorie manquante : ${slug}. Lancez npm run db:seed`);
    }
  }

  const created: string[] = [];
  const skipped: string[] = [];

  for (const item of ARTICLES) {
    const category = categoryBySlug.get(item.categorySlug)!;
    const project = projectByCategorySlug.get(item.categorySlug);
    const isNewsCategory = item.categorySlug === "actualites" || item.categorySlug === "formation";
    const author = users[item.authorIndex % users.length]!;
    const publishedAt = new Date(Date.now() - item.daysAgo * 86_400_000);
    const coverImageUrl = unsplash(item.coverPhotoId);
    const slug = item.slug || slugifyFallback(item.title);

    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      skipped.push(slug);
      continue;
    }

    if (!isNewsCategory && !project) {
      throw new Error(`Projet manquant pour la catégorie ${item.categorySlug}`);
    }

    const article = await prisma.article.create({
      data: {
        title: item.title,
        slug,
        excerpt: item.excerpt,
        content: item.content,
        coverImageUrl,
        coverImagePublicId: null,
        status: ArticleStatus.PUBLISHED,
        publishedAt,
        authorId: author.id,
        projectId: isNewsCategory ? null : project!.id,
        ...(isNewsCategory
          ? {
              categories: {
                create: [{ categoryId: category.id }],
              },
            }
          : {}),
      },
      include: {
        author: { select: { name: true, role: true } },
        project: { select: { title: true } },
      },
    });

    created.push(
      `[${item.categorySlug}] ${article.title} — ${article.author.name} (${article.author.role}) → /a/${article.slug}${article.project ? ` · ${article.project.title}` : ""}`,
    );
  }

  console.log(`\n${created.length} articles créés :\n`);
  for (const line of created) {
    console.log(`  • ${line}`);
  }
  if (skipped.length > 0) {
    console.log(`\n${skipped.length} déjà présents (ignorés) : ${skipped.join(", ")}`);
  }

  const counts = await prisma.articleCategory.groupBy({
    by: ["categoryId"],
    _count: true,
  });
  console.log("\nTotaux par catégorie (tous articles) :");
  for (const row of counts) {
    const cat = categories.find((c) => c.id === row.categoryId);
    console.log(`  ${cat?.name ?? row.categoryId}: ${row._count}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

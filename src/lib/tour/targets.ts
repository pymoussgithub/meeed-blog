/**
 * Registre des `data-tour-id` stables pour l’assistant démo.
 * Format : {domaine}.{zone}.{élément}
 */
export const TOUR_TARGETS = {
  // Nav
  "nav.header.articles": "nav.header.articles",
  "nav.header.forum": "nav.header.forum",
  "nav.header.projets": "nav.header.projets",
  "nav.header.documents": "nav.header.documents",
  "nav.header.contact": "nav.header.contact",
  "nav.header.categories": "nav.header.categories",
  "nav.header.menu": "nav.header.menu",
  "nav.header.login": "nav.header.login",
  "nav.header.root": "nav.header.root",

  // Accueil
  "home.hero": "home.hero",
  "home.news-carousel": "home.news-carousel",

  // Articles public
  "articles.list.card": "articles.list.card",
  "articles.filters.toggle": "articles.filters.toggle",
  "articles.filters.panel": "articles.filters.panel",
  "articles.pagination": "articles.pagination",
  "articles.categories.link": "articles.categories.link",
  "category.card": "category.card",
  "category.filtered-list": "category.filtered-list",

  // Article
  "article.header": "article.header",
  "article.body": "article.body",
  "article.documents": "article.documents",
  "article.share.copy-link": "article.share.copy-link",
  "article.linked-topics": "article.linked-topics",
  "article.public-preview": "article.public-preview",

  // Documents
  "documents.toolbar": "documents.toolbar",
  "documents.filters.panel": "documents.filters.panel",
  "documents.view": "documents.view",
  "documents.download": "documents.download",

  // Projets
  "projets.grid": "projets.grid",
  "projets.card": "projets.card",
  "projets.donate": "projets.donate",

  // Forum
  "forum.categories.table": "forum.categories.table",
  "forum.category.row": "forum.category.row",
  "forum.topic.row": "forum.topic.row",
  "forum.topic.reply-gate": "forum.topic.reply-gate",
  "forum.search.link": "forum.search.link",
  "forum.search.input": "forum.search.input",
  "forum.search.submit": "forum.search.submit",
  "forum.search.result": "forum.search.result",
  "forum.reply.form": "forum.reply.form",
  "forum.reply.submit": "forum.reply.submit",
  "forum.topic.subscribe": "forum.topic.subscribe",
  "forum.new-topic": "forum.new-topic",
  "forum.topic.rubrique": "forum.topic.rubrique",
  "forum.topic.title": "forum.topic.title",
  "forum.topic.body": "forum.topic.body",
  "forum.topic.publish": "forum.topic.publish",
  "forum.topic.pin": "forum.topic.pin",
  "forum.topic.lock": "forum.topic.lock",
  "forum.topic.unlock": "forum.topic.unlock",
  "forum.linked-article": "forum.linked-article",

  // Contact
  "contact.mailto": "contact.mailto",

  // Auth
  "auth.login.email": "auth.login.email",
  "auth.login.password": "auth.login.password",
  "auth.login.submit": "auth.login.submit",
  "auth.login.register": "auth.login.register",
  "auth.login.back-home": "auth.login.back-home",
  "auth.forgot-password": "auth.forgot-password",
  "auth.forgot.email": "auth.forgot.email",
  "auth.forgot.submit": "auth.forgot.submit",

  // Admin sidebar
  "admin.sidebar.articles": "admin.sidebar.articles",
  "admin.sidebar.documents": "admin.sidebar.documents",
  "admin.sidebar.categories": "admin.sidebar.categories",
  "admin.sidebar.projets": "admin.sidebar.projets",
  "admin.sidebar.utilisateurs": "admin.sidebar.utilisateurs",
  "admin.sidebar.forum": "admin.sidebar.forum",
  "admin.sidebar.forum-rubriques": "admin.sidebar.forum-rubriques",
  "admin.sidebar.forum-abonnements": "admin.sidebar.forum-abonnements",
  "admin.sidebar.profil": "admin.sidebar.profil",
  "admin.sidebar.aide": "admin.sidebar.aide",

  // Admin dashboard / articles
  "admin.dashboard.stats": "admin.dashboard.stats",
  "admin.dashboard.stat-card": "admin.dashboard.stat-card",
  "admin.dashboard.recents": "admin.dashboard.recents",
  "admin.articles.new-button": "admin.articles.new-button",
  "admin.articles.list": "admin.articles.list",
  "admin.articles.filters": "admin.articles.filters",
  "admin.articles.archive": "admin.articles.archive",
  "admin.articles.republish": "admin.articles.republish",

  // Article form
  "article.form.title": "article.form.title",
  "article.form.categories": "article.form.categories",
  "article.form.excerpt": "article.form.excerpt",
  "article.form.cover": "article.form.cover",
  "article.form.body": "article.form.body",
  "article.form.publish": "article.form.publish",
  "article.form.save-draft": "article.form.save-draft",
  "article.form.forum-links": "article.form.forum-links",
  "article.form.editor-h2": "article.form.editor-h2",
  "article.form.editor-bold": "article.form.editor-bold",
  "article.form.editor-list": "article.form.editor-list",
  "article.form.editor-link": "article.form.editor-link",
  "article.form.editor-image": "article.form.editor-image",

  // Documents admin
  "admin.documents.upload": "admin.documents.upload",
  "admin.documents.title": "admin.documents.title",
  "admin.documents.visibility": "admin.documents.visibility",
  "admin.documents.list": "admin.documents.list",

  // Categories / projets / users admin
  "admin.categories.form": "admin.categories.form",
  "admin.categories.list": "admin.categories.list",
  "admin.projets.new-button": "admin.projets.new-button",
  "admin.projets.form": "admin.projets.form",
  "admin.projets.save": "admin.projets.save",
  "admin.utilisateurs.form": "admin.utilisateurs.form",
  "admin.utilisateurs.list": "admin.utilisateurs.list",

  // Forum admin
  "admin.forum.moderation": "admin.forum.moderation",
  "admin.forum.hide": "admin.forum.hide",
  "admin.forum.restore": "admin.forum.restore",
  "admin.forum.move": "admin.forum.move",
  "admin.forum.rubriques.form": "admin.forum.rubriques.form",
  "admin.forum.rubriques.list": "admin.forum.rubriques.list",

  // Profil / aide
  "admin.profil.name": "admin.profil.name",
  "admin.profil.save": "admin.profil.save",
  "admin.profil.password": "admin.profil.password",
  "admin.aide.search": "admin.aide.search",
  "admin.aide.card": "admin.aide.card",
} as const;

export type TourTargetId = (typeof TOUR_TARGETS)[keyof typeof TOUR_TARGETS];

export function tourTargetSelector(id: string): string {
  return `[data-tour-id="${id}"]`;
}

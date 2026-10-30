const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
});

navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
});

document.querySelector('#year').textContent = new Date().getFullYear();
const orcidIds = {
  'marielle karine bouyou akotet': '0000-0002-7992-4630',
  'denise patricia mawili mboumba': '0000-0002-4554-4365',
  'mbondoukwe': '0000-0002-4994-3355',
  'bridy chesly moutombi ditombi': '0000-0001-7811-2334',
  'jacques mari ndong ngomo': '0000-0002-3880-7323',
  'bedrich pongui ngondza': '0000-0002-5109-3177',
  'vanessa koumba lengongo': '0000-0002-5919-4511',
  'ornella anaise mbang nguema': '0000-0002-6884-9428',
  'cyrille bisseye': '0000-0002-6888-6317',
  'patrick mickala': '0000-0002-5376-0906'
};
const normalizeName = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
const cleanAuthorName = (value) => value.replace(/\b(?:Dr|Pr|Prof(?:esseur)?|Docteur|M(?:me|r|lle))\.?\s*/gi, '').replace(/\s+/g, ' ').trim();
const pubmedSearchFor = (name) => {
  const clean = cleanAuthorName(name).replace(/[’']/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(Boolean);
  const initials = words.slice(0, -1).map((word) => word[0]).join('');
  const surname = words.at(-1) || clean;
  const surnamePair = words.slice(-2).join(' ');
  const variants = new Set([clean, clean.replace(/-/g, ' '), clean.replace(/\s+/g, '-')]);
  if (initials) {
    variants.add(`${initials} ${surname}`);
    variants.add(`${initials} ${surnamePair}`);
  }
  variants.add(surname);
  if (words.length > 1) {
    variants.add(surnamePair);
    variants.add(words.slice(-2).join('-'));
  }
  const terms = [...variants].map((variant) => `"${variant}"[Author]`);
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(terms.join(' OR '))}`;
};
const profileLinksFor = (name) => {
  const cleanName = cleanAuthorName(name);
  const query = encodeURIComponent(cleanName);
  const normalizedName = normalizeName(cleanName);
  const orcidId = Object.entries(orcidIds).find(([person]) => normalizedName.includes(person))?.[1];
  return [
    ['PubMed', pubmedSearchFor(cleanName), 'assets/logo-pubmed.png'],
    ['ORCID', orcidId ? `https://orcid.org/${orcidId}` : `https://orcid.org/orcid-search/search?searchQuery=${query}`, 'assets/logo-orcid.png'],
    ['ResearchGate', `https://www.researchgate.net/search/researcher?q=${query}`, 'assets/logo-researchgate.png']
  ];
};

document.querySelectorAll('.member-grid .member-card').forEach((card) => {
  const name = card.querySelector('h4')?.textContent.trim();
  if (!name || normalizeName(name).includes('beatrice mozogo') || card.querySelector('.member-social-links')) return;
  const links = document.createElement('div');
  links.className = 'member-social-links';
  profileLinksFor(name).forEach(([label, href, icon]) => {
    const link = document.createElement('a');
    link.className = `social-link social-${label.toLowerCase()}`;
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${label} : ${name}`);
    link.title = label;
    const image = document.createElement('img');
    image.src = icon;
    image.alt = label;
    link.append(image);
    links.append(link);
  });
  card.querySelector('div')?.append(links);
});

const researcherGrid = document.querySelector('.unit-grid');
if (researcherGrid) {
  const profileDialog = document.createElement('dialog');
  profileDialog.className = 'researcher-dialog';
  profileDialog.setAttribute('aria-labelledby', 'researcher-dialog-name');
  profileDialog.innerHTML = '<button class="researcher-dialog-close" type="button" aria-label="Fermer">×</button><div class="researcher-dialog-content"><div class="researcher-dialog-photo"></div><div class="researcher-dialog-info"><p class="eyebrow">Profil du chercheur</p><h2 id="researcher-dialog-name"></h2><p class="researcher-dialog-help">Consulter ses publications et ses activités scientifiques :</p><div class="researcher-links"></div></div></div>';
  document.body.append(profileDialog);

  const closeButton = profileDialog.querySelector('.researcher-dialog-close');
  closeButton.addEventListener('click', () => profileDialog.close());
  profileDialog.addEventListener('click', (event) => {
    if (event.target === profileDialog) profileDialog.close();
  });

  researcherGrid.querySelectorAll('.unit-card li').forEach((item) => {
    const originalImage = item.querySelector('img');
    const name = (item.querySelector('span')?.textContent || item.textContent).trim();
    if (!name) return;

    const avatarInitials = name.split(/\s+/).filter((part) => !/^(Pr|Dr|Prof\.?|Docteur)$/i.test(part)).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
    const openProfile = document.createElement('button');
    openProfile.type = 'button';
    openProfile.className = 'researcher-open';
    openProfile.setAttribute('aria-label', `Voir le profil de ${name}`);
    if (originalImage) {
      const portrait = originalImage.cloneNode(true);
      portrait.alt = `Portrait de ${name}`;
      openProfile.append(portrait);
      item.replaceChildren(openProfile);
    } else {
      const initials = document.createElement('span');
      initials.className = 'researcher-initials';
      initials.setAttribute('aria-hidden', 'true');
      initials.textContent = name.split(/\s+/).filter((part) => !/^(Pr|Dr|Prof\.?|Docteur)$/i.test(part)).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
      openProfile.append(initials);
      item.replaceChildren(openProfile);
    }
    const label = document.createElement('span');
    label.className = 'researcher-name';
    label.textContent = name;
    openProfile.append(label);

    openProfile.addEventListener('click', () => {
      profileDialog.querySelector('#researcher-dialog-name').textContent = name;
      const photoArea = profileDialog.querySelector('.researcher-dialog-photo');
      photoArea.replaceChildren();
      if (originalImage) {
        const largePhoto = originalImage.cloneNode(true);
        largePhoto.alt = `Portrait de ${name}`;
        photoArea.append(largePhoto);
      } else {
        const fallback = document.createElement('span');
        fallback.className = 'researcher-initials researcher-initials-large';
        fallback.textContent = avatarInitials;
        fallback.setAttribute('aria-hidden', 'true');
        photoArea.append(fallback);
      }
      const links = profileLinksFor(name);
      const linksContainer = profileDialog.querySelector('.researcher-links');
      linksContainer.replaceChildren();
      links.forEach(([labelText, href, icon]) => {
        const link = document.createElement('a');
        link.className = `social-link social-${labelText.toLowerCase()}`;
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', `${labelText} : ${name}`);
        const image = document.createElement('img');
        image.src = icon;
        image.alt = labelText;
        link.append(image);
        const text = document.createElement('span');
        text.textContent = labelText;
        link.append(text);
        linksContainer.append(link);
      });
      profileDialog.showModal();
    });
  });
}

const mentoringGrid = document.querySelector('.mentoring-grid');
if (mentoringGrid) {
  const studentDialog = document.createElement('dialog');
  studentDialog.className = 'student-list-dialog';
  studentDialog.setAttribute('aria-labelledby', 'student-list-title');
  studentDialog.innerHTML = '<button class="student-list-close" type="button" aria-label="Fermer">×</button><h2 id="student-list-title"></h2><div class="student-list-content"></div>';
  document.body.append(studentDialog);

  studentDialog.querySelector('.student-list-close').addEventListener('click', () => studentDialog.close());
  studentDialog.addEventListener('click', (event) => {
    if (event.target === studentDialog) studentDialog.close();
  });

  let studentRecordsPromise;
  const loadStudentRecords = () => {
    if (!studentRecordsPromise) {
      studentRecordsPromise = fetch('assets/encadrements-etudiants.json')
        .then((response) => {
          if (!response.ok) throw new Error('Impossible de charger le fichier des encadrements.');
          return response.json();
        })
        .then((data) => data);
    }
    return studentRecordsPromise;
  };

  const content = studentDialog.querySelector('.student-list-content');
  mentoringGrid.querySelectorAll('[data-student-category]').forEach((trigger) => {
    trigger.addEventListener('click', async () => {
      const category = trigger.dataset.studentCategory;
      const label = trigger.dataset.studentLabel || trigger.querySelector('b')?.textContent.trim() || 'Étudiants encadrés';
      studentDialog.querySelector('#student-list-title').textContent = label;
      content.replaceChildren();
      const loading = document.createElement('p');
      loading.className = 'student-list-message';
      loading.textContent = 'Chargement de la liste…';
      content.append(loading);
      studentDialog.showModal();

      try {
        const data = await loadStudentRecords();
        const records = data.records || [];
        if (category === 'PHD') {
          content.replaceChildren();
          const names = data.phdNames || [];
          if (names.length) {
            const note = document.createElement('p');
            note.className = 'student-list-message';
            note.textContent = 'Personnes signalées comme PhD. Le classeur transmis ne précise pas ici les années ni les titres de thèse de doctorat.';
            const list = document.createElement('ul');
            list.className = 'student-name-list';
            names.forEach((name) => {
              const item = document.createElement('li');
              item.textContent = name;
              list.append(item);
            });
            content.append(note, list);
          }
          return;
        }
        const matchingRecords = records.filter((record) => record.category === category);
        content.replaceChildren();
        if (!matchingRecords.length) {
          const empty = document.createElement('p');
          empty.className = 'student-list-message';
          empty.textContent = category === 'DES'
            ? 'Aucun travail de catégorie DES ne figure dans le classeur fourni.'
            : 'Aucun étudiant n’est renseigné pour cette catégorie dans le classeur fourni.';
          content.append(empty);
          return;
        }

        const groupedByYear = new Map();
        matchingRecords.forEach((record) => {
          const year = String(record.year || 'Année non renseignée');
          if (!groupedByYear.has(year)) groupedByYear.set(year, []);
          groupedByYear.get(year).push(record);
        });

        [...groupedByYear.entries()]
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .forEach(([year, yearRecords]) => {
            const section = document.createElement('section');
            section.className = 'student-year-group';
            const heading = document.createElement('h3');
            heading.textContent = year;
            const list = document.createElement('ul');
            yearRecords.forEach((record) => {
              const item = document.createElement('li');
              const author = document.createElement('strong');
              author.textContent = record.author || 'Auteur non renseigné';
              const title = document.createElement('span');
              title.textContent = record.title || 'Titre non renseigné';
              item.append(author, title);
              list.append(item);
            });
            section.append(heading, list);
            content.append(section);
          });
      } catch (error) {
        content.replaceChildren();
        const message = document.createElement('p');
        message.className = 'student-list-message student-list-error';
        message.textContent = 'La liste ne peut pas être chargée pour le moment. Vérifiez que le fichier des encadrements a bien été ajouté au dossier assets.';
        content.append(message);
      }
    });
  });
}

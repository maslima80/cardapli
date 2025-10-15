CARDAPLI — Product & Architecture Spec
Versão Final – Outubro 2025 (para Windsurf)
🎯 Missão

Cardapli ajuda pequenos empreendedores brasileiros a apresentar seus produtos e serviços de forma profissional, rápida e bonita — sem precisar de um e-commerce.

A plataforma é mobile-first, intuitiva e voltada para quem vende pelo WhatsApp e Instagram, permitindo criar e compartilhar catálogos digitais e uma página pública (/@slug) em minutos.

🧠 Filosofia do Produto

Tudo é um catálogo.
Qualquer combinação de produtos (manual, por categoria ou tag) vira um catálogo com link próprio.

Construtor único para tudo.
O mesmo sistema de blocos serve para montar catálogos e o perfil público.

Simplicidade total.
Não há checkout nem carrinho — foco é apresentação e compartilhamento.

Controle visual.
O que o usuário adiciona no builder = o que aparece publicamente.

Criação instantânea.
Quick Catalogs e templates prontos reduzem o tempo de criação para segundos.

🌍 Estrutura de URLs
Página	Exemplo	Descrição
Perfil público	https://cardapli.com.br/@docesdamaria	Página principal (link in bio) criada no /perfil
Catálogo público	https://cardapli.com.br/c/catalogo-pascoa-2025	Página individual de catálogo
Dashboard	/dashboard	Painel inicial com atalhos e catálogos recentes
Catálogos	/catalogos	Lista, edição e criação de catálogos
Produtos	/produtos	Gestão de produtos (criar, editar, buscar, filtrar)
Compartilhar	/compartilhar	Criador rápido de catálogos
Perfil	/perfil	Editor de informações + construtor da página pública /@slug
🧭 Navegação (mobile-first)

Bottom navigation bar:

Aba	Ícone	Rota	Função
🏠 Início	Home	/dashboard	Atalhos e catálogos recentes
🗂️ Catálogos	Folder	/catalogos	Gerenciar e criar catálogos
📦 Produtos	Box	/produtos	Biblioteca de produtos
💬 Compartilhar	Send	/compartilhar	Criação e envio rápido
⚙️ Perfil	User	/perfil	Informações e página pública
🧱 Núcleo: Sistema de Blocos

Todos os conteúdos — catálogos e perfis — são compostos por blocos modulares.
O usuário adiciona, reordena e personaliza blocos livremente.

🪟 Tipos de blocos atualmente implementados
1. Conteúdo visual e textual
Nome	Função
Capa	Imagem de destaque com título
Texto Livre	Texto formatado com título opcional
Imagem	Foto única com legenda
Vídeo	Incorpora vídeo YouTube/Vimeo
Divisor	Linha de separação entre seções
2. Organização de produtos
Nome	Função
Grade de Produtos	Lista ou grade de produtos
Categorias	Mostra categorias com navegação
Tags	Filtra ou mostra produtos por tags
3. Informações de negócio
Nome	Função
Sobre o Negócio	História, missão e propósito
Benefícios	Lista de vantagens ou diferenciais
Passo a passo	Guia de instruções sequenciais
Perguntas Frequentes	Dúvidas comuns
Info Importante	Destaques críticos (aviso, prazo etc.)
4. Credibilidade e engajamento
Nome	Função
Depoimentos	Avaliações de clientes
Localizações	Endereço ou mapa (unidades físicas)
5. Contato e redes
Nome	Função
Contato	Botões WhatsApp, telefone, e-mail
Redes Sociais	Links para redes sociais principais
6. Especial para Perfil Público
Nome	Função
Catálogos (novo)	Lista de catálogos selecionados ou automáticos a exibir em /@slug
📦 Produtos

Cada produto contém:
nome, preço, fotos[], descrição, ingredientes, tags[], categoria, status

Pode ter variações, ex: “sabores”, “tamanhos”.

Interface /produtos:

Pesquisa e filtro

Multi-seleção

Botão flutuante “Compartilhar” (gera Quick Catalog)

🗂️ Catálogos

Estrutura:

title, slug, cover, visibility, template_id, content_blocks[]

Edição com o mesmo builder descrito acima.

Cada catálogo gera uma URL /c/[slug].

Pode ser adicionado ao perfil público ou compartilhado por link.

Estados de visibilidade
Nome	Ícone	Descrição
🌎 Mostrar no perfil	Globe	Aparece no perfil público
🔗 Apenas com link	Link	Só quem receber o link pode ver
✏️ Rascunho	Pencil	Somente o usuário vê

Default para catálogos rápidos → “Apenas com link”.

⚡ Quick Catalog Flow

Fluxo usado para gerar catálogos instantâneos:

Usuário seleciona produtos (manual / categoria / tags).

Tela “Criar Catálogo Rápido”:

Título (auto: Sugestões – data)

Capa (auto do primeiro produto)

Layout (grade / cards)

Descrição (opcional)

Template (opcional)

Gera instantaneamente um catálogo não listado (visibility = unlisted).

Exibe modal de compartilhamento:

WhatsApp (deep link)

Copiar link

E-mail

QR Code

Toast:

✨ Catálogo criado! Você pode editar ou compartilhar agora.

🎨 Templates

Pacotes visuais que definem:

Layout de capa, grade e tipografia

Paleta de cores

Estilo de botões e divisores

Aplicáveis tanto em catálogos quanto no perfil.

Picker visual com miniaturas.

Mudança de template não altera conteúdo, apenas estilo.

🧾 Perfil Builder (/perfil)

O /perfil é o centro do usuário:
edita informações + monta a página pública /@slug.

Seções
A. Informações do Negócio

Foto/logo

Nome do negócio

Slogan / bio curta

Cores e fonte

WhatsApp, telefone, e-mail

Redes sociais

Botões: [Ver página pública] [Copiar link]

B. Montar Página Pública (Builder)

Usa o mesmo sistema de blocos descrito acima.

Blocos disponíveis para o perfil:

Cabeçalho / Bio

Texto Livre

Imagem

Redes Sociais

WhatsApp CTA (Contato)

Depoimentos / Sobre o Negócio

Catálogos (novo tipo):

Opções: “Mostrar todos automaticamente” ou “Selecionar manualmente”

Multi-select e drag-and-drop

O que estiver no builder = o que aparece no /@slug.

Preview instantâneo.

Exemplo de topo da tela

Sua Página Pública
cardapli.com.br/@docesdamaria
[Ver página] [Copiar link]
Monte aqui sua página pública com catálogos, fotos e redes sociais.

🪩 Página Pública /@slug

Renderização de todos os blocos do perfil_blocks.
Design responsivo, estilo link-in-bio premium.
Mostra:

Cabeçalho (foto, nome, slogan)

Catálogos (cards)

Blocos adicionais (texto, depoimentos, etc.)

Contatos e redes sociais

Nenhum toggle de “público”.
→ O que o usuário constrói = o que aparece.

🔗 Ações Rápidas
No painel /catálogos:

Editar

Compartilhar

Adicionar ao perfil

Modal: “Adicionado ao bloco Catálogos do seu perfil.”

Duplicar

Excluir

No /perfil:

Dentro do bloco “Catálogos” → botão “Adicionar catálogo”

Multi-select + drag-and-drop para ordenar

📈 Compartilhamento

WhatsApp: https://wa.me/?text={texto+URL}

E-mail: mailto:?subject={titulo}&body={url}

QR Code: gerado client-side

Copiar link: com feedback de sucesso

Preview (OG tags): imagem + título + descrição

🔐 Estrutura de Dados
Tabela	Campos principais
profiles	user_id, slug, business_name, colors, socials, theme_id
perfil_blocks	user_id, order, type, props (JSON)
catalogs	id, user_id, title, slug, visibility, template_id, cover
content_blocks	catalog_id, type, props, order
products	id, user_id, name, price, photos[], description, tags[], category
🚀 Ordem Recomendada de Desenvolvimento

✅ Blocos (já implementados)

✅ /catalogos UI — compact cards + actions

✅ Quick Catalog Flow

✅ Templates base

🟣 Implementar /perfil Builder e bloco “Catálogos”

🟣 Renderizar /@slug com perfil_blocks

🟢 Polimento de compartilhamento (QR, OG tags, preview)

🟢 Templates adicionais e temas visuais

💬 Textos-guia de UX (PT-BR)

Dialogo de visibilidade:

Quem pode ver este catálogo?

🌎 Mostrar no meu perfil

🔗 Apenas com link (recomendado)

✏️ Rascunho (somente eu)*

Empty State (catálogos):

Sem tempo? Gere um catálogo em segundos — selecione produtos e pronto.

Empty State (perfil):

Sua página pública ainda está vazia. Adicione blocos e catálogos para começar.

Feedback:

✨ Catálogo criado! Você pode editar ou compartilhar agora.

🧭 Posicionamento

Cardapli é o link-in-bio com alma de catálogo, feito para o Brasil real.
Não é e-commerce, não é PDF — é a vitrine digital que cabe no WhatsApp.

Público-alvo:

Artesãos e criadores

Lojas de presentes personalizados

Confeiteiros e produtores caseiros

Pequenos negócios locais

“Crie, mostre e envie seus produtos em minutos — tudo no seu link.”

heres a research to understand our persona and niches:
Nichos e personas-alvo

Nosso foco são MEIs e pequenos empreendedores cujo produto é feito sob medida ou personalizado. Entre eles destacam-se:

Artesãos criativos: produtores de bijuterias, decoração, cerâmica, arte têxtil etc., que fabricam peças exclusivas. Esse público valoriza qualidade e história por trás do produto
acim.com.br
acim.com.br
. Muitas vezes são donas de negócios informais, atendem por encomenda e buscam ampliar vendas além de feiras.

Fabricantes de vestuário/artesanato têxtil: costureiras e estilistas independentes que produzem roupas sob medida ou em pequena escala. Elas precisavam até então mostrar seus catálogos (foto de peças, variações de tecido), mas não usam e-commerce tradicional por terem estoques variáveis.

Empreendedores de alimentos artesanais: confeiteiros, chocolatiers, padarias artesanais e “docerias” de festas. Envolvem bolos de casamento, bem-casados, brigadeiros gourmets, geleias caseiras, queijos artesanais, cestas de café da manhã com queijos e doces, etc. Esses negócios são altamente personalizados (sabores, decoração) e atualmente recebem encomendas por WhatsApp/Instagram.

Serviços de festas e eventos: buffets pequenos e doceiras que atendem casamentos e aniversários. Enviam cotações de bolos, sobremesas e itens de festa diretamente aos noivos, sem loja online. Nossa solução pode transformar esse processo em pedido organizado online.

Lojas de presentes personalizados: empreendedores que montam kits e cestas (cesta de queijo, café da manhã, kits corporativos) ou imprimem brindes (canecas, placas, camisas) sob demanda. A produção ser feita após o pedido torna a logística de e-commerce padrão impraticável; por isso precisam de sistema flexível de pedidos.

Artigos de beleza e lar feitos à mão: fabricantes de velas artesanais, sabonetes naturais, cosméticos caseiros, acessórios de papelaria (convites personalizados, cadernos artesanais), entre outros produtos manuais. São segmentos em expansão (tendência de produtos sustentáveis e únicos) e normalmente pequenos negócios locais.
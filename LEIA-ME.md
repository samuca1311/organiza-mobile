# Organiza

Projeto mobile em HTML, CSS e JavaScript puros. Cada tela agora tem seu próprio arquivo HTML, com títulos, textos, botões, links e formulários escritos nele.

## Abrir

Abra a pasta no VS Code e use o Live Server em `index.html`. Outra opção é executar `python -m http.server 5500` dentro da pasta e acessar `http://localhost:5500`.

Use sempre o mesmo endereço e porta para manter os dados do navegador. Os arquivos usam scripts clássicos e caminhos relativos, sem framework, instalação de pacotes, compilação ou busca de HTML por JavaScript. É possível abrir `index.html` diretamente, mas o compartilhamento de localStorage entre arquivos e a API de senha dependem do navegador; prefira localhost ou HTTPS.

No primeiro acesso, escolha **Primeiro acesso? Criar conta** ou **Explorar demonstração**. Depois selecione o perfil.

## Arquivos HTML

| Arquivo | Tela |
| --- | --- |
| `index.html` | Login |
| `cadastro.html` | Criar conta |
| `perfis.html` | Selecionar perfil |
| `inicio.html` | Painel inicial do gestor ou das aulas |
| `horarios.html` | Horários e detalhes das aulas |
| `cursos.html` | Cursos |
| `turmas.html` | Turmas |
| `colaboradores.html` | Colaboradores |
| `salas.html` | Salas |
| `avisos.html` | Conflitos e histórico de alterações |
| `ajustes.html` | Mensagem “Ainda em desenvolvimento” |
| `assistente.html` | Apresentação do assistente local |
| `chat.html` | Conversa com o assistente local |

Os links usam `<a href="arquivo.html">`. Cada clique abre outro documento. A sessão e os cadastros são recuperados do localStorage ao carregar a nova página.

O painel inicial contém duas seções: uma para o gestor e outra para participante/colaborador. O JavaScript mostra a seção correspondente ao perfil.

Os formulários de edição, confirmações, cartões das listas e mensagens também estão no HTML, em elementos `<template>`. O JavaScript copia esses modelos e preenche os dados. Os botões de ação (salvar, excluir, escolher dia etc.) continuam sendo `<button>`, pois executam ações na página.

## CSS e JavaScript

- `style.css`: visual compartilhado, incluindo os links com aparência de botão.
- `dados.js`: dados iniciais, armazenamento, sessão, funções auxiliares, hash de senha e regras de conflito.
- `app.js`: preenchimento das listas e campos, login, escolha de perfil, cadastros, eventos e comandos do assistente.
- `assets/`: imagens que você adicionar.

Para editar um texto ou botão fixo, procure o HTML da tela. Para mudar uma regra ou o preenchimento de uma lista, procure a função correspondente em `app.js` ou `dados.js`. Os ícones simples usados nas listas são SVGs definidos em `dados.js`; os ícones fixos estão nos HTMLs.

## Funcionalidades

- Criar conta local, entrar e restaurar a sessão ao abrir outra página ou recarregar.
- Selecionar Participante, Gestor ou Colaborador.
- Criar, editar e excluir cursos, turmas, colaboradores, salas e aulas.
- Buscar cadastros e filtrar turmas por curso e turno.
- Consultar horários por turma e dia e abrir detalhes das aulas.
- Bloquear exclusão de cursos, professores e salas que ainda estão em uso.
- Detectar aulas sobrepostas para a mesma sala, turma ou professor.
- Salvar cadastros e histórico de alterações no navegador.
- Consultar conflitos e propor troca de sala no assistente local, com confirmação antes de aplicar.

O link de um curso abre `turmas.html?curso=ID`. O botão Revisar aula abre `horarios.html?editar=ID`, seleciona a turma e o dia da aula e abre a edição.

Os dados iniciais incluem um conflito proposital na terça-feira. Os ajustes continuam em desenvolvimento: edição de perfil, troca de perfil pelos ajustes, exportação, informações de salvamento e saída da conta permanecem indisponíveis.

O ícone e o atalho do assistente continuam fora do menu inferior. O cartão “Gerar automaticamente” abre `chat.html`. A página `assistente.html` continua disponível pelo endereço direto.

## Salvamento e login

Os dados continuam na chave `organiza-v1` do localStorage. As contas e cadastros da versão anterior são reutilizados no mesmo endereço, porta e navegador. Não há sincronização entre aparelhos. Limpar os dados do navegador apaga essas informações.

Este é um login de protótipo, sem servidor. Use uma senha de teste. O hash SHA-256 com salt foi preservado, mas a seleção de perfis não oferece controle de acesso real. A API de senha exige um contexto compatível, como localhost ou HTTPS.

As páginas internas redirecionam para o login quando não há sessão. As páginas de gerenciamento e assistente exigem o perfil Gestor na interface.

## Adicionar imagens

Coloque os arquivos em:

- `assets/logo.png`: logo completa, com símbolo e nome.
- `assets/google.png`: ícone do Google.
- `assets/telefone.png`: ícone do telefone.

Depois recarregue a página. Até adicionar as imagens, os espaços ficam vazios. Para usar outros nomes ou formatos, altere o atributo `src` das imagens nos arquivos HTML correspondentes. O favicon personalizado continua removido.

Adicionar as imagens não ativa o login com Google ou telefone. Esses botões continuam mostrando a mensagem sobre a integração futura.

## Assistente

O assistente usa regras locais, sem modelo de IA externo. Exemplo de comando: `Trocar a sala da turma 62-2 para C306`. Ele permite consultar conflitos ou trocar a sala principal e as aulas da turma após confirmar. Não gera uma grade completa automaticamente.

## Hospedagem

Publique todos os arquivos HTML junto de `style.css`, `dados.js`, `app.js` e `assets/`. Mantenha a estrutura da pasta para os links relativos funcionarem, inclusive no GitHub Pages.

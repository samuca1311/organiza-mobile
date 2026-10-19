# Organiza

Site mobile inspirado no protótipo enviado. HTML, CSS e JavaScript puros, sem framework, bibliotecas externas ou instalação de dependências.

## Abrir

Abra `index.html` no navegador. Para desenvolver, recomendo abrir a pasta no VS Code e usar a extensão Live Server. Também é possível servir a pasta com `python -m http.server 5500` e acessar `http://localhost:5500`.

Na tela inicial, clique em **Primeiro acesso? Criar conta**. Crie um usuário de teste e escolha o perfil. Ou clique em **Explorar demonstração** para usar os dados de exemplo imediatamente.

O layout ocupa a largura do celular até 430 px. Em computadores ele permanece centralizado nessa largura: não há versão desktop. As telas rolam normalmente, com o menu fixo na parte inferior.

## Arquivos para editar

- `index.html`: documento principal, área da aplicação, modal e aviso de salvamento.
- `style.css`: todas as cores, tamanhos, cartões, formulários e navegação.
- `app.js`: dados iniciais, telas, eventos, login local, salvamento e assistente.
- `assets/`: pasta para imagens e ícones próprios.

O JavaScript usa funções diretas, objetos e arrays. Os comentários indicam as principais decisões. Não existe etapa de compilação.

## O que funciona

- Criar conta local, entrar, sair e manter a sessão depois de recarregar.
- Perfis Participante, Gestor e Colaborador, com troca em Ajustes.
- Painel de resumo do gestor e painel de aulas do participante/colaborador.
- Criar, editar e excluir cursos, turmas, colaboradores, salas e aulas.
- Buscar cadastros e filtrar turmas por curso e turno.
- Consultar horários por turma e dia da semana e abrir detalhes das aulas.
- Bloquear exclusão de cursos, professores e salas que ainda estão em uso.
- Detectar aulas sobrepostas para a mesma sala, turma ou professor.
- Salvar nome, perfil, turma selecionada, cadastros e histórico de alterações.
- Exportar dados em JSON (consulta/backup manual; não há importação pela interface).
- Assistente local: consultar conflitos ou propor a troca de sala de uma turma. A troca só acontece depois de confirmar. Exemplo: `Trocar a sala da turma 62-2 para C306`.

Os dados iniciais contêm um conflito proposital na terça-feira para demonstrar os alertas. O assistente informa conflitos após alterar salas; não resolve automaticamente todas as restrições de uma grade.

## Salvamento e login

Tudo fica no `localStorage`, na chave `organiza-v1`. Cada conta tem seus próprios cadastros; a sessão é restaurada ao reabrir o mesmo endereço no mesmo navegador. As alterações são salvas ao confirmar cada formulário.

Sair da conta não apaga os dados. Limpar os dados do navegador apaga as contas e os cadastros locais. Outro navegador, aparelho, domínio ou porta possui armazenamento separado. Mudar do arquivo local para um servidor também pode trocar o armazenamento.

**Este é um login de protótipo, não autenticação de produção.** A senha usa hash SHA-256 com salt para não ser gravada diretamente, mas os dados e os perfis continuam controlados no próprio navegador. Use uma senha de teste. A seleção de perfil é livre e não protege informações. Para publicar com usuários reais, é necessário implementar backend, autenticação e permissões no servidor. `crypto.subtle` requer contexto seguro; use HTTPS, localhost ou um navegador que permita essa API em arquivos locais.

## Adicionar imagens

1. Coloque a logo completa do Organiza (símbolo e nome) em `assets/logo.png`.
2. Coloque o ícone do Google em `assets/google.png`.
3. Coloque o ícone do telefone em `assets/telefone.png`.
4. Recarregue a página. Os caminhos já estão configurados em `app.js`.

Não há dependências de imagens remotas. Enquanto os arquivos não forem fornecidos, os espaços ficam vazios. O evento `onerror` oculta as imagens ausentes, mantendo o espaço reservado pelo CSS. Para usar outros nomes ou formatos, altere os caminhos em `app.js`. Consulte também `assets/IMAGENS.md`.

O calendário que imitava a logo, a letra G e o telefone em SVG foram removidos desses espaços. Os demais ícones de navegação e ações continuam em SVG. O favicon personalizado também foi removido; `index.html` usa um ícone vazio para evitar a busca automática por `favicon.ico`.

## Organização do JavaScript

As funções auxiliares usam declarações `function`. A criação das aulas de exemplo e a comparação de conflitos usam laços `for`. A escolha da tela usa `switch`, e os filtros e bloqueios de exclusão usam condições separadas. A tela de login tem variáveis para os textos e HTML distribuído em várias linhas. As regras, os dados salvos e as funcionalidades continuam os mesmos.

## Integrações futuras

Google e telefone têm os botões e os pontos de entrada na interface, mas ainda não estão conectados a um provedor de autenticação. Os botões explicam isso ao clicar. Adicionar apenas a imagem do Google não ativa o login.

A tela Organiza IA preserva a proposta visual e oferece um assistente **por regras locais**, sem usar modelo de IA. Para conectar um serviço real, substitua a lógica da função `sendMessage` por uma chamada ao seu backend. Nunca coloque chaves privadas de API no JavaScript do navegador.

## Hospedagem estática

Qualquer servidor estático pode servir `index.html`, `style.css`, `app.js` e `assets/` na mesma pasta. Este repositório contém apenas os arquivos do projeto e a documentação.

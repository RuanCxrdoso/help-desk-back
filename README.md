## 📋 Casos de Uso (Roadmap de Desenvolvimento)

Abaixo estão todos os requisitos funcionais do sistema, modelados como Use Cases da camada de Aplicação.

### Fase 1: Autenticação e Gestão de Usuários
- [ ] `RegisterUserUseCase`: Cadastro de um novo usuário definindo sua role (`EMPLOYEE` ou `TECHNICIAN`).
- [ ] `AuthenticateUserUseCase`: Validação de credenciais e geração de JWT (Access Token e Refresh Token).
- [ ] `GetUserProfileUseCase`: Retorna os dados do usuário logado (essencial para a renderização inicial no Next.js).

### Fase 2: Infraestrutura de Arquivos (Storage)
- [ ] `UploadAndCreateAttachmentUseCase`: Recebe um arquivo via `multipart/form-data`, valida formato/tamanho, faz o upload para o Storage (ex: AWS S3 ou R2) e persiste o registro no banco.

### Fase 3: Domínio Core - Visão do Funcionário (Employee)
- [ ] `CreateTicketUseCase`: Abertura de um chamado contendo título, descrição, categoria, prioridade e anexos iniciais (vinculação via Watched Lists). Status inicial obrigatório: `OPEN`.
- [ ] `EditTicketUseCase`: Permite ao autor alterar a descrição e gerenciar anexos (adicionar/remover) **somente** se o ticket estiver no status `OPEN`.
- [ ] `CancelTicketUseCase`: Autor cancela o próprio chamado antes de ser atendido.
- [ ] `FetchEmployeeTicketsUseCase`: Listagem paginada dos tickets pertencentes exclusivamente ao funcionário logado.
- [ ] `GetTicketDetailsUseCase`: Retorna todos os dados de um ticket (relacionamentos preenchidos). Valida se o usuário logado é o autor ou se é um técnico.

### Fase 4: Domínio Core - Visão do Técnico (Technician)
- [ ] `FetchAllTicketsUseCase`: Listagem global paginada com suporte a filtros combinados (status, prioridade, categoria) e ordenação (Data de criação). Fonte de dados para o TanStack Table.
- [ ] `AssignTicketUseCase`: Técnico "puxa" o ticket para si. Altera o status para `IN_PROGRESS` e define o `assigneeId`. (Gatilho para Domain Event).
- [ ] `ResolveTicketUseCase`: Técnico finaliza o atendimento, escrevendo uma nota técnica obrigatória de resolução. Altera status para `RESOLVED`. (Gatilho para Domain Event).
- [ ] `CloseTicketUseCase`: Técnico arquiva o ticket definitivamente (`CLOSED`). Nenhuma modificação posterior é permitida.

### Fase 5: Interações e Histórico (Thread)
- [ ] `CommentOnTicketUseCase`: Permite que o autor do ticket ou o técnico responsável enviem mensagens na thread do chamado para tirar dúvidas ou pedir mais informações.
- [ ] `FetchTicketCommentsUseCase`: Listagem paginada do histórico de mensagens de um ticket específico.

### Fase 6: Eventos de Domínio e Efeitos Colaterais (Background)
- [ ] `OnTicketAssigned` (Subscriber): Ouve a transição para `IN_PROGRESS` e invoca o envio de e-mail ao autor original informando qual técnico assumiu o chamado.
- [ ] `OnTicketResolved` (Subscriber): Ouve a transição para `RESOLVED` e invoca o envio de e-mail ao autor contendo a nota de resolução do técnico.
- [ ] `SendEmailNotificationUseCase`: Executa o disparo real do e-mail utilizando provedor externo (ex: Resend, SendGrid).

---

## 🔐 Matriz de Permissões (RBAC)

O controle de acesso baseado em papéis (Role-Based Access Control) dita quais Casos de Uso e dados cada ator pode acessar no sistema.

| Recurso / Ação | Funcionário (`EMPLOYEE`) | Técnico (`TECHNICIAN`) | Regra de Negócio Técnica |
| :--- | :--- | :--- | :--- |
| **Login e Perfil** | Permitido | Permitido | Acesso global mediante credenciais válidas. |
| **Criar Ticket** | Permitido | Permitido | Técnicos também podem abrir chamados para si ou outros setores. |
| **Editar/Cancelar Ticket** | Permitido (Apenas os seus) | Negado | Um técnico não edita o relato do usuário. O usuário só edita se `status === OPEN`. |
| **Visualizar Lista de Tickets** | Permitido (Apenas os seus) | Permitido (Todos) | Filtragem aplicada na camada de repositório (Database Query) baseada na role do token JWT. |
| **Visualizar Detalhes do Ticket** | Permitido (Apenas os seus) | Permitido (Todos) | Exceção de `NotAllowedError` caso um funcionário tente ler a URL/ID do ticket de outro. |
| **Assumir Ticket (`Assign`)**| Negado | Permitido | Transição de `OPEN` para `IN_PROGRESS`. |
| **Resolver/Fechar Ticket** | Negado | Permitido (Apenas o responsável) | Apenas o técnico que deu o `Assign` (ou um Admin) pode marcar como `RESOLVED`. |
| **Comentar no Ticket** | Permitido (Apenas os seus) | Permitido | Comunicação bidirecional travada se o status for `CLOSED`. |
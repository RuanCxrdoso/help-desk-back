## 📋 Casos de Uso (Roadmap de Desenvolvimento)

Abaixo estão todos os requisitos funcionais do sistema, modelados como Use Cases da camada de Aplicação.

### Fase 1: Autenticação, Gestão de Usuários e Multi-tenancy
- [ ✅ ] `RegisterTenantAndAdminUseCase`: Fluxo de *SaaS Onboarding*. Cria uma nova empresa (Tenant) e seu administrador fundador em uma única transação atômica no banco de dados, validando unicidade de *slug* e e-mail global.
- [ ✅ ] `RegisterAdminUseCase`: Cadastro de administradores adicionais atrelados a um Tenant existente. **Restrito a Super Administradores**. 
- [ ✅ ] `RegisterTechnicianUseCase`: Cadastro de novos técnicos operacionais atrelados a um Tenant. **Restrito a Administradores**.
- [ ✅ ] `RegisterEmployeeUseCase`: Cadastro de funcionários (clientes finais) atrelados a um Tenant. **Restrito a Administradores**.
- [ ✅ ] `AuthenticateSuperAdminUseCase`: Autenticação exclusiva para a plataforma (Host). Requer apenas e-mail e senha, gerando um JWT de administração global (sem `tenantId`).
- [ ✅ ] `AuthenticateUseCase`: Autenticação de usuários do tenant (Admins, Técnicos e Funcionários). Exige o `tenantSlug` (contexto do Workspace) para isolamento lógico e retorna um JWT contendo o `tenantId`.
- [ ] `GetUserProfileUseCase`: Retorna os dados do usuário logado baseado no `sub` e `tenantId` do token (essencial para a renderização inicial e controle de rotas no Next.js).

### Fase 2: Infraestrutura de Arquivos (Storage)
- [ ] `UploadAndCreateAttachmentUseCase`: Recebe um arquivo via `multipart/form-data`, valida formato/tamanho, faz o upload para o Storage (ex: AWS S3 ou R2) e persiste o registro lógico no banco.

### Fase 3: Domínio Core - Visão do Funcionário (Employee)
- [ ] `CreateTicketUseCase`: Abertura de um chamado contendo título, descrição, categoria, prioridade e anexos iniciais (vinculação via Watched Lists). Status inicial obrigatório: `OPEN`.
- [ ] `EditTicketUseCase`: Permite ao autor alterar a descrição e gerenciar anexos (adicionar/remover) **somente** se o ticket estiver no status `OPEN`.
- [ ] `CancelTicketUseCase`: Autor cancela o próprio chamado antes de ser atendido.
- [ ] `FetchEmployeeTicketsUseCase`: Listagem paginada dos tickets pertencentes exclusivamente ao funcionário logado.
- [ ] `GetTicketDetailsUseCase`: Retorna todos os dados de um ticket. Valida se o usuário logado é o autor original, um técnico ou admin.

### Fase 4: Domínio Core - Visão do Técnico (Technician)
- [ ] `FetchAllTicketsUseCase`: Listagem global paginada com suporte a filtros combinados (status, prioridade, categoria) e ordenação. Fonte de dados para o TanStack Table.
- [ ] `AssignTicketUseCase`: Técnico assume o ticket. Altera o status de `OPEN` para `IN_PROGRESS` e define o `assigneeId`. (Gatilho para Domain Event).
- [ ] `ResolveTicketUseCase`: Técnico finaliza o atendimento com uma nota técnica de resolução. Altera status para `RESOLVED`. (Gatilho para Domain Event).
- [ ] `CloseTicketUseCase`: Fechamento definitivo (`CLOSED`) após a resolução. Nenhuma modificação posterior é permitida.
- [ ] `UnassignTicketUseCase`: Técnico devolve o ticket para a fila (`OPEN`), removendo sua autoria.
- [ ] `ReopenTicketUseCase`: Ticket retorna de `RESOLVED`/`CLOSED` para `OPEN` caso o problema persista.

### Fase 5: Interações e Histórico (Thread)
- [ ] `CommentOnTicketUseCase`: Permite envio de mensagens na thread do chamado para tirar dúvidas ou pedir mais informações.
- [ ] `FetchTicketCommentsUseCase`: Listagem paginada do histórico de mensagens de um ticket específico.

### Fase 6: Eventos de Domínio e Efeitos Colaterais (Background)
- [ ] `OnTicketAssigned` (Subscriber): Ouve a transição para `IN_PROGRESS` e invoca o envio de e-mail ao autor original informando qual técnico assumiu o chamado.
- [ ] `OnTicketResolved` (Subscriber): Ouve a transição para `RESOLVED` e invoca o envio de e-mail ao autor contendo a nota de resolução do técnico.
- [ ] `SendEmailNotificationUseCase`: Executa o disparo real do e-mail utilizando provedor externo.

---

## 🔐 Matriz de Permissões (RBAC)

O controle de acesso baseado em papéis (Role-Based Access Control) dita quais Casos de Uso cada ator pode executar. O sistema possui um modelo de privilégios concêntricos (Admin herda acessos de Técnico, que acessa dados de Employee).

| Recurso / Ação | Funcionário (`EMPLOYEE`) | Técnico (`TECHNICIAN`) | Admin (`ADMIN`) | Regra de Negócio (Application Rules) |
| :--- | :--- | :--- | :--- | :--- |
| **Login e Perfil** | Permitido | Permitido | Permitido | Acesso global mediante credenciais válidas. |
| **Cadastrar Usuários**| Negado | Negado | **Permitido** | O Use Case barra a execução se o requestor não for Admin. |
| **Criar Ticket** | Permitido | Permitido | Permitido | Técnicos/Admins também podem ser clientes do suporte. |
| **Editar/Cancelar** | Permitido (Apenas seus) | Negado | Permitido | O usuário só edita se `status === OPEN`. |
| **Listar Tickets** | Permitido (Apenas seus) | Permitido (Todos) | Permitido (Todos) | Filtragem aplicada na query do Repositório via JWT role. |
| **Detalhes do Ticket**| Permitido (Apenas seus) | Permitido (Todos) | Permitido (Todos) | Exceção `NotAllowedError` se um funcionário acessar ID de terceiros. |
| **Assumir (`Assign`)**| Negado | Permitido | Permitido | Transição restrita de `OPEN` para `IN_PROGRESS`. |
| **Resolver Ticket** | Negado | Permitido (Responsável)| Permitido | Apenas o técnico designado ou um Admin podem resolver. |
| **Fechar Ticket** | Negado | Permitido (Responsável)| Permitido | Transição restrita de `RESOLVED` para `CLOSED`. |
| **Comentar** | Permitido (Apenas seus) | Permitido | Permitido | Comunicação bloqueada se o status for `CLOSED`. |
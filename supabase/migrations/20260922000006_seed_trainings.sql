-- =====================================================================
-- FITTRACK · 006 · Seed: catálogo inicial de treinos (idempotente)
-- =====================================================================

insert into public.training_catalog (id, name, description, goal, difficulty, duration_minutes, xp_reward) values
  ('11111111-1111-4111-8111-000000000001', 'Full Body Iniciante', 'Treino de corpo inteiro para criar base de força e aprender os movimentos fundamentais.', 'saude', 'iniciante', 35, 80),
  ('11111111-1111-4111-8111-000000000002', 'Peito e Tríceps', 'Foco em empurrar: peitoral, ombro anterior e tríceps com volume moderado.', 'ganhar_massa', 'intermediario', 50, 120),
  ('11111111-1111-4111-8111-000000000003', 'Costas e Bíceps', 'Foco em puxar: dorsais, trapézio e bíceps para postura e força.', 'ganhar_massa', 'intermediario', 50, 120),
  ('11111111-1111-4111-8111-000000000004', 'Pernas', 'Quadríceps, posteriores e glúteos. Treino pesado para membros inferiores.', 'ganhar_massa', 'avancado', 60, 160),
  ('11111111-1111-4111-8111-000000000005', 'Cardio Moderado', 'Sessão contínua para condicionamento aeróbico e gasto calórico.', 'perder_peso', 'iniciante', 30, 80),
  ('11111111-1111-4111-8111-000000000006', 'HIIT 20', 'Intervalado de alta intensidade: 40s de esforço, 20s de descanso.', 'condicionamento', 'avancado', 20, 140),
  ('11111111-1111-4111-8111-000000000007', 'Core e Mobilidade', 'Abdômen, lombar e mobilidade de quadril e ombros. Ótimo para dias leves.', 'saude', 'iniciante', 25, 70)
on conflict (id) do update set
  name = excluded.name, description = excluded.description, goal = excluded.goal,
  difficulty = excluded.difficulty, duration_minutes = excluded.duration_minutes, xp_reward = excluded.xp_reward;

insert into public.training_exercises (training_id, name, description, sets, repetitions, duration_seconds, order_index) values
  ('11111111-1111-4111-8111-000000000001', 'Agachamento livre', 'Pés na largura dos ombros, desça até a coxa ficar paralela ao chão.', 3, 12, null, 1),
  ('11111111-1111-4111-8111-000000000001', 'Flexão de braço (joelhos apoiados)', 'Mantenha o core firme e desça o peito até perto do chão.', 3, 10, null, 2),
  ('11111111-1111-4111-8111-000000000001', 'Remada com halter', 'Apoie uma mão no banco e puxe o halter até a lateral do tronco.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000001', 'Afundo alternado', 'Passo à frente, joelho de trás quase tocando o chão.', 3, 10, null, 4),
  ('11111111-1111-4111-8111-000000000001', 'Prancha frontal', 'Corpo alinhado da cabeça aos calcanhares.', 3, null, 30, 5),
  ('11111111-1111-4111-8111-000000000002', 'Supino reto com barra', 'Escápulas retraídas, barra descendo até a linha do peito.', 4, 10, null, 1),
  ('11111111-1111-4111-8111-000000000002', 'Supino inclinado com halteres', 'Banco a 30°, controle a descida.', 3, 12, null, 2),
  ('11111111-1111-4111-8111-000000000002', 'Crucifixo na máquina', 'Movimento amplo, pausa de 1s no pico.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000002', 'Mergulho no banco', 'Cotovelos apontando para trás.', 3, 12, null, 4),
  ('11111111-1111-4111-8111-000000000002', 'Tríceps na polia com corda', 'Abra a corda no final do movimento.', 3, 15, null, 5),
  ('11111111-1111-4111-8111-000000000003', 'Puxada frontal', 'Puxe a barra até o queixo, peito aberto.', 4, 10, null, 1),
  ('11111111-1111-4111-8111-000000000003', 'Remada curvada com barra', 'Tronco a 45°, puxe a barra até o umbigo.', 4, 10, null, 2),
  ('11111111-1111-4111-8111-000000000003', 'Remada baixa na polia', 'Coluna neutra, cotovelos rentes ao corpo.', 3, 12, null, 3),
  ('11111111-1111-4111-8111-000000000003', 'Rosca direta com barra', 'Sem balançar o tronco.', 3, 12, null, 4),
  ('11111111-1111-4111-8111-000000000003', 'Rosca martelo', 'Pegada neutra, alternando os braços.', 3, 12, null, 5),
  ('11111111-1111-4111-8111-000000000004', 'Agachamento com barra', 'Profundidade completa com coluna neutra.', 5, 8, null, 1),
  ('11111111-1111-4111-8111-000000000004', 'Leg press 45°', 'Pés na largura do quadril, sem travar os joelhos.', 4, 12, null, 2),
  ('11111111-1111-4111-8111-000000000004', 'Stiff com barra', 'Quadril para trás, barra rente às pernas.', 4, 10, null, 3),
  ('11111111-1111-4111-8111-000000000004', 'Cadeira extensora', 'Pausa de 1s com a perna estendida.', 3, 15, null, 4),
  ('11111111-1111-4111-8111-000000000004', 'Mesa flexora', 'Controle a volta em 3 segundos.', 3, 12, null, 5),
  ('11111111-1111-4111-8111-000000000004', 'Panturrilha em pé', 'Amplitude total, pausa no topo.', 4, 15, null, 6),
  ('11111111-1111-4111-8111-000000000005', 'Aquecimento na esteira', 'Caminhada leve.', null, null, 300, 1),
  ('11111111-1111-4111-8111-000000000005', 'Corrida leve', 'Ritmo em que ainda é possível conversar.', null, null, 1200, 2),
  ('11111111-1111-4111-8111-000000000005', 'Bicicleta ergométrica', 'Carga moderada, cadência constante.', null, null, 480, 3),
  ('11111111-1111-4111-8111-000000000005', 'Desaquecimento', 'Caminhada lenta e respiração controlada.', null, null, 180, 4),
  ('11111111-1111-4111-8111-000000000006', 'Burpee', 'Explosão no salto, peito no chão na descida.', 4, null, 40, 1),
  ('11111111-1111-4111-8111-000000000006', 'Mountain climber', 'Joelhos rápidos em direção ao peito.', 4, null, 40, 2),
  ('11111111-1111-4111-8111-000000000006', 'Agachamento com salto', 'Aterrisse suave e emende a próxima repetição.', 4, null, 40, 3),
  ('11111111-1111-4111-8111-000000000006', 'Polichinelo', 'Ritmo alto e constante.', 4, null, 40, 4),
  ('11111111-1111-4111-8111-000000000006', 'Prancha com toque no ombro', 'Quadril estável durante o toque.', 4, null, 40, 5),
  ('11111111-1111-4111-8111-000000000007', 'Gato-camelo', 'Mobilize a coluna devagar, vértebra por vértebra.', 2, 10, null, 1),
  ('11111111-1111-4111-8111-000000000007', 'Dead bug', 'Lombar colada no chão, braço e perna opostos.', 3, 10, null, 2),
  ('11111111-1111-4111-8111-000000000007', 'Ponte de glúteo', 'Contraia o glúteo no topo por 2s.', 3, 15, null, 3),
  ('11111111-1111-4111-8111-000000000007', 'Prancha lateral', 'Quadril alto, corpo alinhado.', 3, null, 30, 4),
  ('11111111-1111-4111-8111-000000000007', 'Alongamento de flexores do quadril', 'Posição de afundo, quadril para frente.', 2, null, 45, 5)
on conflict (training_id, order_index) do update set
  name = excluded.name, description = excluded.description, sets = excluded.sets,
  repetitions = excluded.repetitions, duration_seconds = excluded.duration_seconds;

import { MOCK_METRICAS, MOCK_HISTORICO_CHECKINS } from './mock-data';

export async function verificarCheckinHoje(pacienteId) {
  // Mock: always return false so the check-in form is shown
  return false;
}

export async function salvarCheckin(pacienteId, dados) {
  console.log('Mock: check-in salvo', dados);
  return { success: true, data: { id: 'mock-new', ...dados } };
}

export async function buscarMetricasPaciente(pacienteId, tentativas = 1) {
  return MOCK_METRICAS;
}

export async function buscarHistoricoCheckins(pacienteId, dias = 7, tentativas = 1) {
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - dias);
  const dataInicioStr = dataInicio.toISOString().split('T')[0];
  return MOCK_HISTORICO_CHECKINS.filter((c) => c.data_checkin >= dataInicioStr);
}

export function calcularEquilibrioGeral(checkin) {
  const sono = checkin.sono_qualidade * 0.7 + (checkin.sono_tempo_horas / 8 * 10) * 0.3;
  const atividade = (checkin.atividade_tempo_horas / 1.5 * 10 * 0.5) + (checkin.atividade_intensidade / 10.0 * 0.5);
  const alimentacao = (checkin.alimentacao_refeicoes / 4.0 * 10 * 0.5) + (checkin.alimentacao_agua_litros / 2.5 * 10 * 0.5);
  const equilibrioGeral = (sono + atividade + alimentacao) / 3.0;
  return Math.min(Math.max(equilibrioGeral, 0), 10);
}

export function calcularAderenciaProtocolo(checkins, metaDias = 7) {
  const meta = Math.max(0, Number(metaDias) || 0);
  if (!checkins || checkins.length === 0 || meta <= 0) {
    return { percentual: 0, realizado: 0, meta };
  }
  const datasUnicas = new Set(checkins.map((c) => c.data_checkin));
  const realizado = datasUnicas.size;
  const percentual = Math.min(100, Math.round((realizado / meta) * 100));
  return { percentual, realizado, meta };
}

export function processarDadosGrafico(checkins) {
  const labels = [];
  const equilibrioGeralData = [];

  checkins.forEach(checkin => {
    const data = new Date(checkin.data_checkin + 'T00:00:00');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    labels.push(`${dia}/${mes}`);

    const equilibrio = calcularEquilibrioGeral(checkin);
    equilibrioGeralData.push(equilibrio.toFixed(1));
  });

  return {
    labels,
    datasets: [
      {
        name: 'Equilíbrio Geral',
        data: equilibrioGeralData,
      },
    ],
  };
}

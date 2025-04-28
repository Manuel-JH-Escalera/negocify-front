import { useState, useMemo } from 'react';
import { formatearFechaGMT4 } from '../../utils/dateUtils';

const useRangoFecha = () => {
    const [periodo, setPeriodo] = useState('mensual');

    const calcularRangoFechas = (periodoSeleccionado = periodo, fechaReferencia = new Date()) => {
        // Si periodoSeleccionado es una fecha específica en formato YYYY-MM-DD
        if (periodoSeleccionado.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return {
            fechaInicio: periodoSeleccionado,
            fechaFin: periodoSeleccionado
          };
        }

        const hoy = fechaReferencia;
        const anioActual = hoy.getFullYear();
        let fechaInicio, fechaFin;
    
        switch (periodoSeleccionado) {
        case 'anual':
            // Todo el año actual
            fechaInicio = `${anioActual}-01-01`;
            fechaFin = `${anioActual}-12-31`;
            break;
            
        case 'mensual':
            // Mes actual
            const mesActual = hoy.getMonth();
            const primerDiaMes = new Date(anioActual, mesActual, 1);
            const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0);
            fechaInicio = formatearFechaGMT4(primerDiaMes);
            fechaFin = formatearFechaGMT4(ultimoDiaMes);
            break;
            
        case 'semanal':
            // Semana actual (Domingo a Sábado)
            const diaSemana = hoy.getDay(); // 0 = Domingo, 6 = Sábado
            const primerDiaSemana = new Date(hoy);
            primerDiaSemana.setDate(hoy.getDate() - diaSemana); // Retroceder al domingo
            
            const ultimoDiaSemana = new Date(primerDiaSemana);
            ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6); // Avanzar al sábado
            
            fechaInicio = formatearFechaGMT4(primerDiaSemana);
            fechaFin = formatearFechaGMT4(ultimoDiaSemana);
            break;
            
        case 'trimestral':
            // Trimestre actual
            const trimestre = Math.floor(hoy.getMonth() / 3);
            const primerMesTrimestre = trimestre * 3;
            const primerDiaTrimestre = new Date(anioActual, primerMesTrimestre, 1);
            const ultimoDiaTrimestre = new Date(anioActual, primerMesTrimestre + 3, 0);
            fechaInicio = formatearFechaGMT4(primerDiaTrimestre);
            fechaFin = formatearFechaGMT4(ultimoDiaTrimestre);
            break;
            
        case 'semestral':
            // Semestre actual
            const semestre = Math.floor(hoy.getMonth() / 6);
            const primerMesSemestre = semestre * 6;
            const primerDiaSemestre = new Date(anioActual, primerMesSemestre, 1);
            const ultimoDiaSemestre = new Date(anioActual, primerMesSemestre + 6, 0);
            fechaInicio = formatearFechaGMT4(primerDiaSemestre);
            fechaFin = formatearFechaGMT4(ultimoDiaSemestre);
            break;
            
        case 'ultimosSieteDias':
            // Últimos 7 días
            const hace7Dias = new Date(hoy);
            hace7Dias.setDate(hoy.getDate() - 6); // 6 días atrás + hoy = 7 días
            fechaInicio = formatearFechaGMT4(hace7Dias);
            fechaFin = formatearFechaGMT4(hoy);
            break;
            
        case 'ultimosTreintaDias':
            // Últimos 30 días
            const hace30Dias = new Date(hoy);
            hace30Dias.setDate(hoy.getDate() - 29); // 29 días atrás + hoy = 30 días
            fechaInicio = formatearFechaGMT4(hace30Dias);
            fechaFin = formatearFechaGMT4(hoy);
            break;
            
        default:
            // Sin filtro (todo el historial)
            fechaInicio = null;
            fechaFin = null;
        }
    
        return { fechaInicio, fechaFin };
    };
  
  
   //descripción legible del período actual
    const descripcionPeriodo = useMemo(() => {
        const { fechaInicio, fechaFin } = calcularRangoFechas();
        
        if (!fechaInicio || !fechaFin) return 'Todo el historial';
        
        if (fechaInicio === fechaFin) {
        return `Día ${fechaInicio}`;
        }
        
        switch (periodo) {
            case 'anual':
                return `Año ${new Date().getFullYear()}`;
            case 'mensual':
                return `Mes ${new Date().toLocaleString('es', { month: 'long' })} ${new Date().getFullYear()}`;
            case 'semanal':
                return `Semana del ${fechaInicio} al ${fechaFin}`;
            case 'trimestral':
                return `Trimestre actual (${fechaInicio} - ${fechaFin})`;
            case 'semestral':
                return `Semestre actual (${fechaInicio} - ${fechaFin})`;
            case 'ultimosSieteDias':
                return `Últimos 7 días (${fechaInicio} - ${fechaFin})`;
            case 'ultimosTreintaDias':
                return `Últimos 30 días (${fechaInicio} - ${fechaFin})`;
            default:
                return `Período del ${fechaInicio} al ${fechaFin}`;
        }
    }, [periodo]);
  
  return {
    periodo,
    setPeriodo,
    calcularRangoFechas,
    descripcionPeriodo
  };
};

export default useRangoFecha;
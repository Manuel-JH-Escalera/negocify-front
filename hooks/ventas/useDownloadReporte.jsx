import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useUserStore from "../../stores/userStore";

/**
 * Hook para descargar reportes de ventas
 */
const useDownloadReporte = () => {
  const { userToken } = useUserStore();

  const downloadReporteMutation = useMutation({
    mutationFn: async ({ almacenId, fechaInicio, fechaFin }) => {
      if (!almacenId || !token) {
        throw new Error("Se requiere ID de almacén y token");
      }

      // Construir la URL con parámetros de fecha si están presentes
      let apiUrl = `${import.meta.env.VITE_API_URL}/ventas/reporte/${almacenId}`;
      const params = new URLSearchParams();
      
      if (fechaInicio) {
        params.append('fechaInicio', fechaInicio);
      }
      
      if (fechaFin) {
        params.append('fechaFin', fechaFin);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        responseType: 'blob' // Importante para recibir archivos
      });

      // Extraer nombre de archivo de la cabecera Content-Disposition si está disponible
      const contentDisposition = response.headers['content-disposition'];
      let filename = `reporte-ventas-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Crear objeto URL y descargar
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true, message: "Reporte descargado correctamente" };
    }
  });

  return {
    downloadReporte: downloadReporteMutation.mutate,
    isDownloading: downloadReporteMutation.isPending,
    downloadError: downloadReporteMutation.error
  };
};

export default useDownloadReporte;
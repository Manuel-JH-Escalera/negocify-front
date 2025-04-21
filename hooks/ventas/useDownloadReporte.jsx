import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import useUserStore from "../../stores/userStore";


const useDownloadReporte = () => {
  const { userToken } = useUserStore();

  const downloadReporteMutation = useMutation({
    mutationFn: async ({ almacenId, fechaInicio, fechaFin }) => {
      if (!almacenId || !userToken) {
        throw new Error("Se requiere ID de almacén y token");
      }

      // Construir la URL con parámetros de fecha si están presentes
      const backUrl = import.meta.env.VITE_BACK_URL;
      let apiUrl = new URL('/api/ventas/reporte/' + almacenId, backUrl).toString();
      const params = new URLSearchParams();
      
      if (fechaInicio) {
        params.append('fechaInicio', fechaInicio);
      }
      
      if (fechaFin) {
        params.append('fechaFin', fechaFin);
      }
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      console.log("Descargando reporte desde:", apiUrl);

      try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${userToken}`
        },
        responseType: 'blob' 
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
    } catch (error) {
      console.error("Error al descargar reporte:", error);
      throw error;
      }
    },
  });

  return {
    downloadReporte: downloadReporteMutation.mutate,
    isDownloading: downloadReporteMutation.isPending,
    downloadError: downloadReporteMutation.error,
    reset: downloadReporteMutation.reset
  };
};

export default useDownloadReporte;
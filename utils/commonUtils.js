export function formatearPesoChileno(valor) {
  if (typeof valor !== "number" || isNaN(valor)) {
    console.error("Error: El valor proporcionado no es un número válido.");
    return "Valor inválido";
  }

  try {
    const formateador = new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    });

    return formateador.format(valor);
  } catch (error) {
    console.error("Error al formatear la moneda:", error);
    return `$ ${valor}`;
  }
}

package cl.aquachile.evalpsi.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.evalpsi.exception.BadRequestException;

@Component
public class CvValidator {

    private static final Set<String> EXTENSIONES = Set.of("pdf", "doc", "docx");
    private static final long MAX_BYTES = 10L * 1024 * 1024;

    public void validar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo del CV está vacío.");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw new BadRequestException("El CV supera el tamaño máximo de 10 MB.");
        }

        String extension = extension(archivo.getOriginalFilename());
        if (!EXTENSIONES.contains(extension)) {
            throw new BadRequestException("El CV debe ser un archivo PDF, DOC o DOCX.");
        }

        byte[] cabecera;
        try (InputStream in = archivo.getInputStream()) {
            cabecera = in.readNBytes(8);
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer el archivo del CV.");
        }

        boolean contenidoValido = switch (extension) {
            case "pdf" -> esPdf(cabecera);
            case "docx" -> esZip(cabecera);
            case "doc" -> esOle(cabecera);
            default -> false;
        };
        if (!contenidoValido) {
            throw new BadRequestException(
                    "El contenido del archivo no coincide con la extensión " + extension + ".");
        }
    }

    public String nombreArchivo(MultipartFile archivo) {
        String nombre = archivo == null ? null : archivo.getOriginalFilename();
        return nombre == null || nombre.isBlank() ? "CV" : nombre;
    }

    private String extension(String nombre) {
        if (nombre == null || !nombre.contains(".")) {
            return "";
        }
        return nombre.substring(nombre.lastIndexOf('.') + 1).toLowerCase();
    }

    private boolean esPdf(byte[] b) {
        return b.length >= 4
                && (b[0] & 0xFF) == 0x25 && (b[1] & 0xFF) == 0x50
                && (b[2] & 0xFF) == 0x44 && (b[3] & 0xFF) == 0x46;
    }

    private boolean esOle(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0xD0 && (b[1] & 0xFF) == 0xCF
                && (b[2] & 0xFF) == 0x11 && (b[3] & 0xFF) == 0xE0;
    }

    private boolean esZip(byte[] b) {
        return b.length >= 4
                && (b[0] & 0xFF) == 0x50 && (b[1] & 0xFF) == 0x4B
                && (b[2] & 0xFF) == 0x03 && (b[3] & 0xFF) == 0x04;
    }
}

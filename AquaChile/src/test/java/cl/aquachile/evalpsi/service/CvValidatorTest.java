package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import cl.aquachile.evalpsi.exception.BadRequestException;

class CvValidatorTest {

    private final CvValidator validator = new CvValidator();

    @Test
    void aceptaPdfValido() {
        byte[] contenido = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31};
        MockMultipartFile archivo = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", contenido);

        assertDoesNotThrow(() -> validator.validar(archivo));
        assertEquals("cv.pdf", validator.nombreArchivo(archivo));
    }

    @Test
    void aceptaDocxValido() {
        byte[] contenido = new byte[]{0x50, 0x4B, 0x03, 0x04, 0x00};
        MockMultipartFile archivo = new MockMultipartFile(
                "cv", "cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", contenido);

        assertDoesNotThrow(() -> validator.validar(archivo));
    }

    @Test
    void aceptaDocValido() {
        byte[] contenido = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, 0x00, 0x00, 0x00, 0x00};
        MockMultipartFile archivo = new MockMultipartFile(
                "cv", "cv.doc", "application/msword", contenido);

        assertDoesNotThrow(() -> validator.validar(archivo));
    }

    @Test
    void rechazaArchivoVacio() {
        MockMultipartFile archivo = new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[0]);
        assertThrows(BadRequestException.class, () -> validator.validar(archivo));
        assertThrows(BadRequestException.class, () -> validator.validar(null));
    }

    @Test
    void rechazaExtensionInvalida() {
        MockMultipartFile archivo = new MockMultipartFile("cv", "cv.txt", "text/plain", new byte[]{1});
        assertThrows(BadRequestException.class, () -> validator.validar(archivo));
    }

    @Test
    void rechazaContenidoQueNoCoincide() {
        MockMultipartFile archivo = new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[]{1, 2, 3, 4});
        assertThrows(BadRequestException.class, () -> validator.validar(archivo));
    }

    @Test
    void rechazaArchivoMuyGrande() {
        byte[] contenido = new byte[10 * 1024 * 1024 + 1];
        MockMultipartFile archivo = new MockMultipartFile("cv", "cv.pdf", "application/pdf", contenido);
        assertThrows(BadRequestException.class, () -> validator.validar(archivo));
    }

    @Test
    void nombrePorDefecto() {
        MockMultipartFile archivo = new MockMultipartFile("cv", null, "application/pdf", new byte[]{1});
        assertEquals("CV", validator.nombreArchivo(archivo));
        assertEquals("CV", validator.nombreArchivo(null));
    }
}

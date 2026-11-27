package cl.aquachile.evalpsi.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.ByteArrayContent;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.UserCredentials;

import cl.aquachile.evalpsi.config.GoogleDriveProperties;
import cl.aquachile.evalpsi.exception.DriveException;

@Service
public class GoogleDriveService {

    private static final String CARPETA_RAIZ = "CVs AquaChile";
    private static final String MIME_CARPETA = "application/vnd.google-apps.folder";

    private final GoogleDriveProperties properties;
    private Drive drive;

    public GoogleDriveService(GoogleDriveProperties properties) {
        this.properties = properties;
    }

    public String obtenerOCrearCarpetaRaiz() {
        return buscarOCrearCarpeta("root", CARPETA_RAIZ);
    }

    public String obtenerOCrearCarpetaCandidato(String raizId, String candidato, String rut) {
        String nombre = sanitizar(candidato) + " - " + normalizarRut(rut);
        return buscarOCrearCarpeta(raizId, nombre);
    }

    public String subir(String carpetaId, String nombre, String contentType, byte[] contenido) {
        try {
            File metadata = new File();
            metadata.setName(nombre);
            metadata.setParents(List.of(carpetaId));
            File subido = drive().files().create(metadata, new ByteArrayContent(contentType, contenido))
                    .setFields("id")
                    .execute();
            return subido.getId();
        } catch (IOException ex) {
            throw new DriveException("No fue posible subir el archivo a Google Drive.");
        }
    }

    public Archivo descargar(String fileId) {
        try {
            File metadata = drive().files().get(fileId).setFields("name, mimeType").execute();
            String mime = metadata.getMimeType() == null ? "application/octet-stream" : metadata.getMimeType();
            try (InputStream in = drive().files().get(fileId).executeMediaAsInputStream()) {
                return new Archivo(metadata.getName(), mime, in.readAllBytes());
            }
        } catch (IOException ex) {
            throw new DriveException("No fue posible descargar el archivo desde Google Drive.");
        }
    }

    public void borrar(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return;
        }
        try {
            drive().files().delete(fileId).execute();
        } catch (IOException ex) {
            // Eliminación best-effort: no interrumpe el flujo principal.
        }
    }

    private String buscarOCrearCarpeta(String padreId, String nombre) {
        String consulta = "name = '" + escapar(nombre) + "' and '" + padreId
                + "' in parents and mimeType = '" + MIME_CARPETA + "' and trashed = false";
        try {
            FileList resultado = drive().files().list()
                    .setQ(consulta)
                    .setFields("files(id)")
                    .setPageSize(10)
                    .execute();
            if (resultado.getFiles() != null && !resultado.getFiles().isEmpty()) {
                return resultado.getFiles().get(0).getId();
            }
            File carpeta = new File();
            carpeta.setName(nombre);
            carpeta.setMimeType(MIME_CARPETA);
            carpeta.setParents(List.of(padreId));
            return drive().files().create(carpeta).setFields("id").execute().getId();
        } catch (IOException ex) {
            throw new DriveException("No fue posible crear la carpeta en Google Drive.");
        }
    }

    private Drive drive() {
        if (drive == null) {
            drive = construirDrive();
        }
        return drive;
    }

    private Drive construirDrive() {
        if (!properties.isConfigured()) {
            throw new DriveException(
                    "Google Drive no está configurado. Revisa GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN en el .env.");
        }
        try {
            GoogleCredentials credenciales = UserCredentials.newBuilder()
                    .setClientId(properties.getClientId())
                    .setClientSecret(properties.getClientSecret())
                    .setRefreshToken(properties.getRefreshToken())
                    .build();
            HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
            return new Drive.Builder(transport, GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credenciales))
                    .setApplicationName("AquaChile")
                    .build();
        } catch (Exception ex) {
            throw new DriveException("No fue posible conectar con Google Drive.");
        }
    }

    private String escapar(String valor) {
        return valor.replace("\\", "\\\\").replace("'", "\\'");
    }

    private String sanitizar(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.trim().replaceAll("\\s+", " ").replaceAll("[/\\\\]", "-");
    }

    private String normalizarRut(String rut) {
        if (rut == null) {
            return "";
        }
        return rut.trim().toUpperCase().replace(".", "").replace("-", "");
    }

    public record Archivo(String nombre, String contentType, byte[] contenido) {
    }
}

package cl.aquachile.evalpsi.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.evalpsi.dto.usuario.ActualizarUsuarioRequest;
import cl.aquachile.evalpsi.dto.usuario.CrearUsuarioRequest;
import cl.aquachile.evalpsi.dto.usuario.UsuarioResponse;
import cl.aquachile.evalpsi.enums.Rol;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.exception.ConflictException;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.mapper.CuentaMapper;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.repository.CuentaRepository;

@Service
public class CuentaService {

    private final CuentaRepository cuentaRepository;
    private final PasswordEncoder passwordEncoder;

    public CuentaService(CuentaRepository cuentaRepository, PasswordEncoder passwordEncoder) {
        this.cuentaRepository = cuentaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return cuentaRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(CuentaMapper::toResponse)
                .toList();
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        String correo = request.correo().trim().toLowerCase();

        if (cuentaRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ConflictException("Ya existe una cuenta con el correo " + correo);
        }

        Cuenta cuenta = Cuenta.builder()
                .correo(correo)
                .password(request.password())
                .passwordHash(passwordEncoder.encode(request.password()))
                .nombre(request.nombre().trim())
                .rol(request.rol())
                .tituloRol(tituloPorDefecto(request.rol(), request.tituloRol()))
                .fechaAlta(LocalDate.now())
                .build();

        return CuentaMapper.toResponse(cuentaRepository.save(cuenta));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        Cuenta cuenta = buscar(id);
        String correo = request.correo().trim().toLowerCase();

        cuentaRepository.findByCorreoIgnoreCase(correo)
                .filter(otra -> !otra.getId().equals(id))
                .ifPresent(otra -> {
                    throw new ConflictException("Ya existe otra cuenta con el correo " + correo);
                });

        cuenta.setCorreo(correo);
        cuenta.setNombre(request.nombre().trim());
        cuenta.setRol(request.rol());
        cuenta.setTituloRol(tituloPorDefecto(request.rol(), request.tituloRol()));

        if (request.password() != null && !request.password().isBlank()) {
            cuenta.setPassword(request.password());
            cuenta.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        return CuentaMapper.toResponse(cuentaRepository.save(cuenta));
    }

    @Transactional
    public void eliminar(Long id, String correoAutenticado) {
        Cuenta cuenta = buscar(id);

        if (cuenta.getCorreo().equalsIgnoreCase(correoAutenticado)) {
            throw new BadRequestException("No puedes eliminar tu propia cuenta.");
        }

        cuentaRepository.delete(cuenta);
    }

    private Cuenta buscar(Long id) {
        return cuentaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la cuenta con id " + id));
    }

    private String tituloPorDefecto(Rol rol, String tituloRecibido) {
        if (tituloRecibido != null && !tituloRecibido.isBlank()) {
            return tituloRecibido.trim();
        }
        return switch (rol) {
            case ADMIN -> "Administrador de Sistemas";
            case ANALISTA -> "Analista de Reclutamiento";
            case EVALUADOR -> "Profesional Evaluador";
        };
    }
}

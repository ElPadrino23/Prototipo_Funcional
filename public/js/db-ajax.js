const log = console.log;

function money(value) {
    return Number(value || 0).toLocaleString('es-MX');
}

function badgeClass(value) {
    if (value === 'Alto' || value === 'Alerta' || value === 'Rechazado') {
        return 'badge-danger';
    }

    if (value === 'Medio' || value === 'Revision' || value === 'Validacion' || value === 'Pendiente') {
        return 'badge-warn';
    }

    return 'badge-ok';
}

function showMessage(message) {
    const wrapper = document.getElementById('formMessage');

    if (wrapper) {
        wrapper.innerHTML = `<div class="feedback">${message}</div>`;
    }
}

async function getJson(url) {
    const response = await fetch(url);

    if (response.ok) {
        return response.json();
    }

    const errorData = await response.json().catch(function() {
        return {};
    });
    alert(errorData.msg || 'HTTP-Error: ' + response.status);
    return {};
}

async function postJson(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        return response.json();
    }

    const errorData = await response.json().catch(function() {
        return {};
    });
    throw new Error(errorData.msg || 'HTTP-Error: ' + response.status);
}

async function cargarClientes() {
    const data = await getJson('/clientes/api/lista');
    const body = document.getElementById('clientesBody');

    if (!body) return;

    body.innerHTML = (data.clientes || []).map(function(cliente) {
        return `
            <tr>
                <td>${cliente.idCliente || ''}</td>
                <td>${cliente.nombre || ''}</td>
                <td>${cliente.rfc || ''}</td>
                <td>${cliente.tipoPersona || ''}</td>
                <td><span class="badge-soft ${badgeClass(cliente.riesgo)}">${cliente.riesgo || ''}</span></td>
                <td>${cliente.esPep ? 'Si' : 'No'}</td>
                <td><span class="badge-soft">${cliente.docs || ''}</span></td>
                <td><a href="/clientes/detalle?id=${cliente.idCliente}" class="btn-small btn">Ver expediente</a></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No hay clientes registrados</td></tr>';
}

async function cargarOperaciones() {
    const data = await getJson('/operaciones/api/lista');
    const body = document.getElementById('operacionesBody');

    if (!body) return;

    body.innerHTML = (data.operaciones || []).map(function(operacion) {
        return `
            <tr>
                <td>${operacion.idOperacion || ''}</td>
                <td>${operacion.cliente || ''}</td>
                <td>${operacion.contrato || ''}</td>
                <td>${operacion.producto || ''}</td>
                <td>${operacion.tipoOperacion || ''}</td>
                <td>$${money(operacion.monto)}</td>
                <td>${operacion.moneda || ''}</td>
                <td>${operacion.fecha || ''}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No hay operaciones registradas</td></tr>';
}

function renderAlertas(lista) {
    const body = document.getElementById('alertasBody');
    if (!body) return;

    body.innerHTML = lista.map(function(alerta) {
        var acciones = '';
        if (alerta.estatus === 'Pendiente') {
            acciones += `<button class="btn-small btn" type="button" onclick="moverEnRevision('${alerta.idAlerta}')">En revisión</button> `;
        }
        if (alerta.estatus !== 'Resuelta') {
            acciones += `<a href="/alertas/detalle?id=${alerta.idAlerta}" class="btn-small btn">Ver detalle</a>`;
        }
        return `
            <tr>
                <td>${alerta.idAlerta || ''}</td>
                <td>${alerta.cliente || ''}</td>
                <td>${alerta.operacion || ''}</td>
                <td>${alerta.regla || ''}</td>
                <td><span class="badge-soft ${badgeClass(alerta.nivel)}">${alerta.nivel || ''}</span></td>
                <td>${alerta.fecha || ''}</td>
                <td>${alerta.responsable || ''}</td>
                <td><span class="badge-soft ${badgeClass(alerta.estatus)}">${alerta.estatus || ''}</span></td>
                <td>${acciones}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="9" style="color:var(--muted)">Sin alertas en este estado</td></tr>';
}

async function cargarAlertas() {
    const data = await getJson('/alertas/api/lista');
    const body = document.getElementById('alertasBody');
    if (!body) return;

    body.innerHTML = (data.alertas || []).map(function(alerta) {
        return `
            <tr>
                <td>${alerta.idAlerta || ''}</td>
                <td>${alerta.cliente || ''}</td>
                <td>${alerta.operacion || ''}</td>
                <td>${alerta.regla || ''}</td>
                <td><span class="badge-soft ${badgeClass(alerta.nivel)}">${alerta.nivel || ''}</span></td>
                <td>${alerta.fecha || ''}</td>
                <td>${alerta.responsable || ''}</td>
                <td><button class="btn-small btn" type="button" onclick="resolverAlerta('${alerta.idAlerta}')">Resolver</button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="8">No hay alertas registradas</td></tr>';
}

async function cargarAlertasConTabs() {
    const data = await getJson('/alertas/api/lista');
    if (typeof todasLasAlertas !== 'undefined') {
        todasLasAlertas = data.alertas || [];
    }
    renderAlertas((data.alertas || []).filter(function(a) { return a.estatus === 'Pendiente'; }));
}

async function moverEnRevision(idAlerta) {
    try {
        await postJson('/alertas/api/estatus', { idAlerta: idAlerta, estatus: 'En revision' });
        cargarAlertasConTabs();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function cargarContratos() {
    const data = await getJson('/contratos/api/lista');
    const body = document.getElementById('contratosBody');

    if (!body) return;

    body.innerHTML = (data.contratos || []).map(function(contrato) {
        return `
            <tr>
                <td>${contrato.idContrato || ''}</td>
                <td>${contrato.cliente || ''}</td>
                <td>${contrato.producto || ''}</td>
                <td>${contrato.inicio || ''}</td>
                <td>${contrato.vencimiento || ''}</td>
                <td>$${money(contrato.saldo)}</td>
                <td><span class="badge-soft ${badgeClass(contrato.estatus)}">${contrato.estatus || ''}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">No hay contratos registrados</td></tr>';
}

async function cargarUsuarios() {
    const data = await getJson('/admin/api/lista');
    const body = document.getElementById('usuariosBody');

    if (!body) return;

    body.innerHTML = (data.usuarios || []).map(function(usuario) {
        return `
            <tr>
                <td>${usuario.idUsuario || ''}</td>
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.correo || ''}</td>
                <td>${usuario.rol || ''}</td>
                <td><span class="badge-soft ${badgeClass(usuario.estado)}">${usuario.estado || ''}</span></td>
                <td>
                    <a href="/admin/editar?id=${usuario.idUsuario}" class="btn-small btn">Editar</a>
                    <form action="/admin/eliminar" method="POST" style="display:inline;">
                        <input type="hidden" name="idusuario" value="${usuario.idUsuario}">
                        <button type="submit" class="btn-small btn" style="background:var(--rojo);">Eliminar</button>
                    </form>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6">No hay usuarios registrados</td></tr>';
}

function tiempoTranscurrido(fecha) {
    if (!fecha) return '';
    const diff = Date.now() - new Date(fecha).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + ' min';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' h';
    return Math.floor(hrs / 24) + ' d';
}

async function cargarDashboard() {
    try {
        const data = await getJson('/api/dashboard');

        const totalClientes          = document.getElementById('totalClientes');
        const totalOperaciones       = document.getElementById('totalOperaciones');
        const totalAlertasPendientes = document.getElementById('totalAlertasPendientes');
        const totalReportesListos    = document.getElementById('totalReportesListos');

        if (totalClientes)          totalClientes.textContent          = data.totalClientes || 0;
        if (totalOperaciones)       totalOperaciones.textContent       = data.totalOperaciones || 0;
        if (totalAlertasPendientes) totalAlertasPendientes.textContent = data.totalAlertasPendientes || 0;
        if (totalReportesListos)    totalReportesListos.textContent    = data.totalReportesListos || 0;

        // Alertas recientes
        const alertasList = document.getElementById('alertasRecientesList');
        if (alertasList) {
            const alertas = data.alertasRecientes || [];
            alertasList.innerHTML = alertas.length === 0
                ? '<li style="color:var(--muted)">Sin alertas recientes</li>'
                : alertas.map(function(a) {
                    return `<li style="padding:8px 0;border-bottom:1px solid var(--borde);">
                        <span class="badge-soft ${badgeClass(a.nivel)}" style="margin-right:8px;">${a.nivel}</span>
                        ${a.descripcion}
                        <span style="color:var(--muted);font-size:12px;margin-left:8px;">${tiempoTranscurrido(a.fecha)}</span>
                    </li>`;
                }).join('');
        }

        // Distribucion de riesgo
        const riesgoBody = document.getElementById('riesgoBody');
        if (riesgoBody) {
            const dist = data.distribucionRiesgo || [];
            riesgoBody.innerHTML = dist.map(function(r) {
                return `<tr>
                    <td><span class="badge-soft ${badgeClass(r.nivel)}">${r.nivel}</span></td>
                    <td>${r.cantidad}</td>
                </tr>`;
            }).join('') || '<tr><td colspan="2" style="color:var(--muted)">Sin datos</td></tr>';
        }
    } catch (error) {
        log('Error al cargar dashboard:', error.message);
    }
}

async function cargarReportes() {
    const data = await getJson('/reportes/api/lista');
    const reportes = data.reportes || [];
    const body = document.getElementById('reportesBody');

    if (!body) return;

    body.innerHTML = reportes.map(function(reporte) {
        return `
            <tr>
                <td>${reporte.clave || ''}</td>
                <td>${reporte.nombre || ''}</td>
                <td>${reporte.periodo || ''}</td>
                <td>${reporte.registros || 0}</td>
                <td><span class="badge-soft ${badgeClass(reporte.estatus)}">${reporte.estatus || ''}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5">No hay reportes registrados</td></tr>';
}

async function resolverAlerta(idAlerta) {
    try {
        await postJson('/alertas/api/resolver', {
            idAlerta:   idAlerta,
            resolucion: 'Resuelta desde la bandeja'
        });
        cargarAlertas();
    } catch (error) {
        alert('Error al resolver alerta: ' + error.message);
    }
}

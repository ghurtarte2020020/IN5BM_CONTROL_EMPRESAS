const Empleado = require('../models/empleado.model');

function RegistrarEmpleado(req, res) {
    let empresaId 

    if(req.user.rol == 'Empresa'){
        empresaId = req.user.sub
    }else if(req.user.rol == 'Admin'){

        if(req.params.idEmpresa==null){
            return res.status(500)
                    .send({ mensaje: 'debe enviar el id de la empresa' });
        }
        empresaId = req.params.idEmpresa
    }

    var parametros = req.body;
    var empleadoModel = new Empleado();

    if(parametros.nombre && parametros.apellido && parametros.puesto && parametros.departamento) {
            empleadoModel.nombre = parametros.nombre;
            empleadoModel.apellido = parametros.apellido;
            empleadoModel.puesto = parametros.puesto;
            empleadoModel.departamento = parametros.departamento;
            empleadoModel.idEmpresa = empresaId;

            empleadoModel.save((err, empleadoGuardado) => {
                if (err) return res.status(500)
                    .send({ mensaje: 'Error en la peticion' });
                if(!empleadoGuardado) return res.status(500)
                    .send({ mensaje: 'Error al agregar el Usuario'});
                
                return res.status(200).send({ empleado: empleadoGuardado });
            });                  
    }else{
        return res.status(500).send({mensaje: "Debe rellenar los campos necesarios"})
    }
}

function MisEmpleados(req, res) {

    let usuarioLogueado

    if(req.user.rol == 'Empresa'){
        usuarioLogueado = req.user.sub
    }else if(req.user.rol == 'Admin'){

        if(req.params.idEmpresa==null){
            return res.status(500)
                    .send({ mensaje: 'debe enviar el id de la empresa' });
        }
        usuarioLogueado = req.params.idEmpresa
    }

    Empleado.find({idEmpresa: usuarioLogueado}, (err, empleadoEncontrado) => {
        if(err) return res.status(500)
        .send({ mensaje: 'Error en la peticion' });

    if(empleadoEncontrado.length==0) return res.status(500)
        .send({ mensaje: 'Error, no cuenta con empleados'});

        let nombreEmpresa = empleadoEncontrado[0].idEmpresa.nombreEmpresa

        CrearExcel(nombreEmpresa, empleadoEncontrado)

        CrearPdf(nombreEmpresa, empleadoEncontrado)
    
    return res.status(200).send({'cantidad de empleados' : empleadoEncontrado.length, empleados : empleadoEncontrado});

    }).populate('idEmpresa', 'nombreEmpresa')
}

function CrearPdf(nombreEmpresa, arrayEmpleados) {
    const fs = require('fs');

    const Pdfmake = require('pdfmake');

    var fonts = {
        Roboto: {
            normal: './src/fonts/roboto/Roboto-Regular.ttf',
            bold: './src/fonts/roboto/Roboto-Medium.ttf',
            italics: './src/fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './src/fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };
    let pdfmake = new Pdfmake(fonts);

    let content = [{
        text:  'Empleados de '+nombreEmpresa,
        alignment: 'center',
        fontSize: 25,
        color: '#094099'
    }]

    for (let i = 0; i < arrayEmpleados.length ; i++) {

        content.push({
            text: ' '
        })
        content.push({
            text:  i+1+')Empleado: '+arrayEmpleados[i].nombre+' '+arrayEmpleados[i].apellido,
            fontSize: 15
        })

        content.push({
            text: 'Puesto: '+arrayEmpleados[i].puesto,
            fontSize: 15
        })

        content.push({
            text: 'Departamento: '+arrayEmpleados[i].departamento,
            fontSize: 15
        })
    }
    let docDefination = {
        content: content
    }
    let pdfDoc = pdfmake.createPdfKitDocument(docDefination, {});
    pdfDoc.pipe(fs.createWriteStream('./src/pdfs/empleados-de-'+nombreEmpresa.toLowerCase() +'.pdf'));
    pdfDoc.end();

}

    function CrearExcel(nombreEmpresa, arrayEmpleados){
        const ExcelJS = require('exceljs')

        const workbook = new ExcelJS.Workbook()

        const sheet = workbook.addWorksheet('empleados')

        sheet.columns = [
            {header: 'nombre', key: 'nombre'},
            {header: 'apellido', key: 'apellido'},
            {header: 'puesto', key: 'puesto'},
            {header: 'departamento', key: 'departamento'}
        ]

        for (let i = 0; i < arrayEmpleados.length ; i++) {
            sheet.addRow({
                nombre: arrayEmpleados[i].nombre,
                apellido: arrayEmpleados[i].apellido,
                puesto: arrayEmpleados[i].puesto,
                departamento: arrayEmpleados[i].departamento
            })
        }

        sheet.columns.forEach(column => {

            var dataMax = 0;
            column.eachCell({ includeEmpty: true }, function(cell){
            var columnLength = cell.value.length;
            if (columnLength > dataMax) {
            dataMax = columnLength;
            }
            })
            column.width = dataMax <= 10 ? 25 : dataMax;    
        })

        sheet.getRow(1).font = {
            bold: true,
            color: {argb: 'ffffff'}
        }

        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            bgColor: {argb: 'ad2f33'}
        }


        sheet.workbook.xlsx.writeFile('./src/exceles/empleados-de-'+nombreEmpresa.toLowerCase()+'-excel.xlsx')
    }

    

module.exports = {
    RegistrarEmpleado,
    MisEmpleados
}
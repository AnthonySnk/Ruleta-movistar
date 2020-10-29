var mediaqueryList = window.matchMedia("(min-width: 500px)");

console.log(mediaqueryList)

var padding = {top:20, right:40, bottom:0, left:0},
            w = 500 - padding.left - padding.right,
            h = 500 - padding.top  - padding.bottom,
            r = Math.min(w, h)/2,
            rotation = 0,
            oldrotation = 0,
            picked = 100000,
            oldpick = [],
            color = d3.scale.category20();//Se obtienen los colores 

        var data = [
                    {"label":"UNA LAPTOP"}, 
                    {"label":"UNA CAMISA"}, 
                    {"label":"UNA JACKET"},
                    {"label":"UN LAPIZ"},
                    {"label":"UNA MESA"},
                    ];
        var svg = d3.select('#chart')
            .append("svg")
            .data([data])
            .attr("width",  w + padding.left + padding.right)
            .attr("height", h + padding.top + padding.bottom);
        var container = svg.append("g")
            .attr("class", "chartholder")
            .attr("transform", "translate(" + (w/2 + padding.left) + "," + (h/2 + padding.top) + ")");
        var vis = container
            .append("g");
            
        var pie = d3.layout.pie().sort(null).value(function(d){return 1;});
        // declaramos una funcion arc generadora
        var arc = d3.svg.arc().outerRadius(r);
        // seleccionamos el acamino, que usara arc para dibujar
        var arcs = vis.selectAll("g.slice")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "slice");
            
        arcs.append("path")
            .attr("fill", function(d, i){ return color(i); })
            .attr("d", function (d) { return arc(d); });
        // Agregamos el texto
        arcs.append("text").attr("transform", function(d){
                d.innerRadius = 0;
                d.outerRadius = r;
                d.angle = (d.startAngle + d.endAngle)/2;
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")translate(" + (d.outerRadius -10) +")";
            })
            .attr("text-anchor", "end")
            .text( function(d, i) {
                return data[i].label;
            });
        container.on("click", spin);
        function spin(d){
            container.on("click", null);
            // Todos los precios ya han sido ganados
            console.log("OldPick: " + oldpick.length, "Data length: " + data.length);
            if(oldpick.length == data.length){
                console.log("done");
                container.on("click", null);
                return;
            }
            var  ps       = 360/data.length,
                 pieslice = Math.round(1440/data.length),
                 rng      = Math.floor((Math.random() * 1440) + 360);
                
            rotation = (Math.round(rng / ps) * ps);
            
            picked = Math.round(data.length - (rotation % 360)/ps);
            picked = picked >= data.length ? (picked % data.length) : picked;
            if(oldpick.indexOf(picked) !== -1){
                d3.select(this).call(spin);
                return;
            } else {
                oldpick.push(picked);
            }
            rotation += 90 - Math.round(ps/2);
            vis.transition()
                .duration(5000)
                .attrTween("transform", rotTween)
                .each("end", function(){
                    //Mostramos al alerta de ganador
                    d3.select(".slice:nth-child(" + (picked + 1) + ") path")
                        .attr("fill", "#86888C");
                    swal('¡Has ganado!',`${data[picked].label}`,'success',{button:"Gracias a Movistar"})
                    oldrotation = rotation;
                    /* El objeto selccionado en "data" */
                    console.log(data[picked].value)
                    container.on("click", spin);
                    // Iniciamos la funcion de tirar confeti
                    confetti.start()
                    //Indicamos la duracion del confetti
                    setTimeout(confetti.stop,3000)
                });
        }
        //Flecha
        svg.append("g")
            .attr("transform", "translate(" + (w + padding.left + padding.right) + "," + ((h/2)+padding.top) + ")")
            .append("path")
            .attr("d", "M-" + (r*.15) + ",0L0," + (r*.05) + "L0,-" + (r*.05) + "Z")
            .style({"fill":"black"});
        //Dibujadno circulo
        container.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 60)
            .style({"fill":"white","cursor":"pointer"});
        //texto de la rueda central
        container.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text("GIRAR")
            .style({"font-weight":"bold", "font-size":"30px"});
        
        
        function rotTween(to) {
        var i = d3.interpolate(oldrotation % 360, rotation);
        return function(t) {
        return "rotate(" + i(t) + ")";};
        }
        
        function getRandomNumbers(){
            //generamos el numero ganador
            var array = new Uint16Array(1000);
            var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);
            if(window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function"){
                window.crypto.getRandomValues(array);
                console.log("works");
            } else {
                for(var i=0; i < 1000; i++){
                    array[i] = Math.floor(Math.random() * 100000) + 1;
                }
            }
            return array;
        }
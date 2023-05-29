let parseTime = d3.timeParse("%d %b %Y %H:%M %p");
// 


d3.json("static/originalData.json", async function (err, data) {

    if (err)
        console.log("Error fetching data!!!")

    const getUniqueData = (key) => {
        return data.map((x) => x[key]).filter((x, i, a) => a.indexOf(x) === i)
    }

    let uniqueComputers = getUniqueData("ComputerName").sort()

    let uniqueUpdates = await data.map((d) => {
        let space_count = 0;
        let third_space_index = 0;
        let str = d["Patch Name"]

        for (let str_i = 0; str_i < str.length; str_i++) {
            if (space_count === 3) {
                third_space_index = str_i;
                break;
            }

            if (str[str_i] === " ") {
                space_count++
            }
        }

        return (str.slice(0, third_space_index))
    })
    uniqueUpdates = [...new Set(uniqueUpdates)]


    const getMyColor = (colorsLength) => {
        
        let r = [];
        for (let i = 0; i < colorsLength; i++) {
            let n = (Math.random() * 0xfffff * 1000000).toString(16);
            r.push('#' + n.slice(0, 6));
        }
        return r;
    };

    var myColor = d3.scaleSequential()
        .domain([0, uniqueUpdates.length])
        .interpolator(d3.interpolateViridis);


    

    function rgbToHex(x) {

        let r = x.split("(")[1].split(")")[0].split(",")[0]
        let g = x.split("(")[1].split(")")[0].split(",")[1]
        let b = x.split("(")[1].split(")")[0].split(",")[2]
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    }


    


    let uniqueHexColors = /*d3.scaleLinear()
                            .domain([0, uniqueUpdates.length])
                            .range(["#a9a9a9", "#FFA500", "#FFC0CB"])*/

        d3.scaleQuantize()
            .domain([0, 50])
            .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
                "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);


    /* 

    
    

    
     */


    var margin = { top: 20, right: 20, bottom: 30, left: 50 }

    current_width = window.innerWidth;
    current_height = 10;
    current_ratio = current_width / current_height;

    var width, height;

    // width was also changed at last line w.r.t to div's width
    width = current_width - margin.left - margin.right
    height = current_height;

    

    for (let multidata_index = 0; multidata_index < uniqueComputers.length; multidata_index++) {

        /* {
            "InstallDate": "07 May 2022 12:56 PM",
            "ComputerName": "DESKTOP-BTTOPL3",
            "Policy": "Manual",
            "Group": "Default",
            "Tags": "",
            "Patch Name": "Security Intelligence Update for Microsoft Defender Antivirus - KB2267602 (Version 1.363.1567.0)",
            "PatchCategory": "Definition Update",
            "PatchReleaseDate": "07 May 2022"
        } */

        var filteredDropdownData = data;
        var filteredTimeline = data;
        let firstPageLoad = true

        const reDraw = (param, chart_id=0, chart_index=null, changed_width=0) => {

            filteredTimeline = data.filter((d, i) => {
                return d["ComputerName"] === param
            })

            

            // if the parameter has changed_width then all the remaining parameters are present too.
            // so using changed_width as foolproof-condition

            if(changed_width) {

                // difference of decreased width should be greater than 20 to redraw chart (increases performance)
                if(Math.abs(changed_width - width) > 20) {

                    chart_id.remove();
                    width = changed_width

                    
                

                    svg = d3.select(`.timeline${chart_index}`)
                            .append("div")
                                .attr("id", `timeline-chart${chart_index}`)
                                .append("svg")
                                    .attr("width", width + margin.left + margin.right)
                                    .attr("height", height + margin.top + margin.bottom)
                                    .append("g")
                                        .attr("class", "fishy")
                                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    
                    // removind and re-adding the resizable
                    $(`.timeline${chart_index}`).remove('ui-resizable-handle')
                    $(`.timeline${chart_index}`).resizable({
                        handles: 'e'
                    });
                    
                    /* d3.selectAll(".dot").remove()
                    d3.selectAll(".x-axis").remove() */

                } else return       // else, exit from the reDraw function, aids in performance
            }

            var x = d3.scaleTime()
                .domain(d3.extent(filteredTimeline, function (d) { return parseTime(d.InstallDate); }))
                .range([0, width - margin.left - margin.right]);

            var xAxis = d3.axisBottom(x)

            /* d3.selectAll(".dot").remove()
            d3.selectAll(".x-axis").remove() */

            svg.selectAll(".dot")
                .data(filteredTimeline)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d) { return x(parseTime(d.InstallDate)) })
                .attr("cy", function (d) { return (height) })
                .attr("fill", "#fff")
                .attr("r", 2.5)
                .attr("stroke", (d) => {
                    let uc
                    for (let i = 0; i < uniqueUpdates.length; i++) {
                        if (d["Patch Name"].includes(uniqueUpdates[i])) {
                            uc = uniqueHexColors(i)
                            break;
                        } else {
                            uc = "#FFC0CB"
                        }
                    }
                    return uc
                })

                .attr("stroke-width", "1.5")
                .on("mouseover", (d) => {
                    svg.selectAll(".dot").style("cursor", "pointer");
                    svg.select("path").style("cursor", "pointer");

                    tooltip.html(`
                                <strong>Patch Name: </strong>${d["Patch Name"]} <br/> 
                                <strong>Patch Release: </strong>${d["PatchReleaseDate"]} <br/>
                                <strong>Patch Installed On: </strong>${d["InstallDate"]} <br/>
                                <strong>Patch Category: </strong>${d["PatchCategory"]}
                            `);

                    return tooltip.style("visibility", "visible");
                })

                .on("mousemove", () => {

                    return tooltip.style("top", (d3.event.pageY + 25) + "px")
                        .style("left", (d3.event.pageX - 15) + "px")

                })

                .on("mouseout", () => {
                    svg.selectAll(".dot").style("cursor", "default");
                    svg.select("path").style("cursor", "default");
                    return tooltip.style("visibility", "hidden")
                });

            svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
        }


        var tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("background", "#fff")
            .style("padding", "5px")
            .style("border-radius", "7px")
            .text("");

        d3.select("body").append("div").attr("class", `timeline${multidata_index}`)
        d3.select(`.timeline${multidata_index}`).append("div").attr("class", `computer-id${multidata_index} computer-names`)
        document.getElementsByClassName(`computer-id${multidata_index}`)[0].innerHTML = `${uniqueComputers[multidata_index]}`


        var svg = d3.select(`.timeline${multidata_index}`)
                    .append("div")
                        .attr("id", `timeline-chart${multidata_index}`)
                        .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                                .attr("class", "fishy")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        d3.select(`.timeline${multidata_index}`)
            .style("border", "1px solid black")
            .style("margin", "5px 20px")
            .style("border-radius", "7px")
            .style("border-bottom-right-radius", "0px")
            .style("overflow", "hidden")

        

        $(`.timeline${multidata_index}`).resizable({
            handles: 'e'
        });

        let calledRedraw = 0
        $(`.timeline${multidata_index}`).resize(function (event) {
            
            reDraw(uniqueComputers[multidata_index], $(`#timeline-chart${multidata_index}`), multidata_index, $(`.timeline${multidata_index}`).width())

            calledRedraw++;
        })


        /* document.querySelector(`.timeline${multidata_index}`)
                .addEventListener("resize", () => { 
                    
                    $('body').prepend('<div>' + $(`.timeline${multidata_index}`).width() + '</div>');
                }) */


        // changing width w.r.t to div's width
        width = $(`.timeline${multidata_index}`).width() - margin.right


        if(!calledRedraw) {
            reDraw(uniqueComputers[multidata_index])
        }

    }
})

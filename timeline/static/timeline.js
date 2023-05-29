let parseTime = d3.timeParse("%d %b %Y %H:%M %p");
let parseDate = d3.timeParse("%Y-%b-%d");

console.log("id is : ", fid)

function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
}

d3.csv("/static/data.csv", async function (err, data) {

    if (err) {
        console.log("Error fetching data!!!")
        return
    }

    const getUniqueData = (key) => {
        return data.map((x) => x[key]).filter((x, i, a) => a.indexOf(x) === i)
    }

    console.log("data is : ", data)
    let uniqueComputers = getUniqueData("Opportunity ID").sort()


    // let filterOppur = []
    let filterByOppurtunities = []

    data.map((fields, index) => {

        let eachField = {
            "Opportunity ID": "",
            "validDatesWithData": []
        }

        Object.keys(fields).filter((fieldKey, index) => {
            let validDate = isValidDate(fieldKey)

            if (fieldKey == "Opportunity ID" || fieldKey == "Account Name" || fieldKey == "Opportunity Name" || fieldKey == "Quantity" || fieldKey == "Total Amount (Required)") {
                eachField[fieldKey] = fields[fieldKey]
            }
            if (validDate && fields[fieldKey] !== "") {
                console.log(fieldKey)
                eachField['validDatesWithData'] = [...eachField['validDatesWithData'], fieldKey]
                eachField[fieldKey] = fields[fieldKey]
            }

            // return fields[fieldKey]
        })

        filterByOppurtunities = [...filterByOppurtunities, eachField]
    })



    console.log("filter by OPP : ")
    console.log(filterByOppurtunities)


    // let uniqueUpdates = await data.map((d) => {
    //     let space_count = 0;
    //     let third_space_index = 0;
    //     let str = d["Patch Name"]

    //     for (let str_i = 0; str_i < str.length; str_i++) {
    //         if (space_count === 3) {
    //             third_space_index = str_i;
    //             break;
    //         }

    //         if (str[str_i] === " ") {
    //             space_count++
    //         }
    //     }

    //     return (str.slice(0, third_space_index))
    // })

    let uniqueUpdates = ["hello", "hello", "world", "world"]

    uniqueOppurtunityID = [...new Set(data['OppurtunityID'])]
    console.log("opp id : ", uniqueOppurtunityID)


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


    let uniqueHexColors = d3.scaleQuantize()
        .domain([0, 50])
        .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
            "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

    // previous colors

    /*d3.scaleLinear()
        .domain([0, uniqueUpdates.length])
        .range(["#a9a9a9", "#FFA500", "#FFC0CB"])*/



    var margin = { top: 20, right: 20, bottom: 30, left: 50 }

    current_width = window.innerWidth;
    current_height = 10;
    current_ratio = current_width / current_height;

    var width, height;

    // width was also changed at last line w.r.t to div's width
    width = current_width - margin.left - margin.right
    height = current_height;

    function chart(multidata_index) {
        /* {
            Account Name: "hawaii state public library system"
            Opportunity ID: "0066T000016da6s"
            Opportunity Name: "Part II= DF Cloud U--Term extended/renewal"
            Quantity: ""
            Total Amount (Required): "69682.5"
            validDatesWithData: ['2023-05-25', '2023-05-24', '2023-05-05', '2023-05-04', '2023-05-02', '2023-04-27', '2023-04-1]

        } */

        var filteredDropdownData = data;

        var filteredTimeline = filterByOppurtunities;

        let firstPageLoad = true

        const reDraw = (param, chart_id = 0, chart_index = null, changed_width = 0) => {

            filteredTimeline = filterByOppurtunities.filter((d, i) => {
                return d["Opportunity ID"] === param
            })

            console.log("Filter Timeline")
            console.log(filteredTimeline)
            console.log("params : ", param)



            // if the parameter has changed_width then all the remaining parameters are present too.
            // so using changed_width as foolproof-condition

            if (changed_width) {

                // difference of decreased width should be greater than 20 to redraw chart (increases performance)
                if (Math.abs(changed_width - width) > 20) {

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
                // .domain(d3.extent(filteredTimeline, function (d) { console.log("on x : ", d.validDatesWithData); return parseDate(d.validDatesWithData); }))
                .domain(d3.extend(filteredTimeline, function (d) {
                    let validDate = isValidDate()
                    if (validDate && fields[fieldKey] !== "") {

                        console.log(fieldKey)
                        eachField['validDatesWithData'] = [...eachField['validDatesWithData'], fieldKey]
                        eachField[fieldKey] = fields[fieldKey]
                    }
                }))
                .range([0, width - margin.left - margin.right]);

            var xAxis = d3.axisBottom(x)

            /* d3.selectAll(".dot").remove()
            d3.selectAll(".x-axis").remove() */

            svg.selectAll(".dot")
                .data(filteredTimeline)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", function (d) { return x(parseDate(d.validDatesWithData)) })
                .attr("cy", function (d) { return (height) })
                .attr("fill", "#fff")
                .attr("r", 2.5)
                .attr("stroke", (d) => {
                    let uc
                    for (let i = 0; i < uniqueUpdates.length; i++) {
                        if (d["Opportunity Name"].includes(uniqueUpdates[i])) {
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
                                <strong>Opportunity Name: </strong>${d["Opportunity Name"]} <br/> 
                                <strong>Quantity: </strong>${d["Quantity"]} <br/>
                                <strong>Total Amount Required: </strong>${d["Total Amount (Required)"]} <br/>
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

        d3.select("body")
            .append("div")
            .attr("class", `timeline${multidata_index}`)

        d3.select(`.timeline${multidata_index}`)
            .append("div")
            .attr("class", `computer-id${multidata_index} computer-names`)

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

        // changing width w.r.t to div's width
        width = $(`.timeline${multidata_index}`).width() - margin.right


        if (!calledRedraw) {
            reDraw(uniqueComputers[multidata_index])
            console.log("re draw")
            console.log(uniqueComputers[multidata_index])
            console.log("multi data index : ", multidata_index)
        }
    }

    if (fid == 0) {
        for (let multidata_index = 0; multidata_index < uniqueComputers.length; multidata_index++) {
            chart(multidata_index)
        }
    } else {
        let idOnUrl = fid;
        console.log("computers unique : ", uniqueComputers)
        let indexOfUrlInJsonData = uniqueComputers.indexOf(idOnUrl)

        chart(indexOfUrlInJsonData)
    }

})

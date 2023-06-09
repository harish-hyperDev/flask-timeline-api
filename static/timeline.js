let parseTime = d3.timeParse("%d %b %Y %H:%M %p");
let parseDate = d3.timeParse("%Y-%m-%d");


console.log("id is : ", fid)

function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
}

function closeTooltip() {
    d3.select('.tooltip')
        .style("visibility", "hidden")
    d3.select('.pointed-arrow')
        .style("visibility", "hidden")

    d3.select(".pointed-arrow").style("visibility", "hidden")
    
}

fetch('/get_data')
    .then(response => response.json())
    .then(responseData => {
        // Handle the received JSON data here
        var data = responseData
        console.log(data);

        const getUniqueData = (key) => {
            return data.map((x) => x[key]).filter((x, i, a) => a.indexOf(x) === i)
        }

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
                if (validDate && fields[fieldKey] !== "" && fields[fieldKey] != null) {
                    eachField['validDatesWithData'] = [...eachField['validDatesWithData'], fieldKey]
                    eachField[fieldKey] = fields[fieldKey]
                }

                // return fields[fieldKey]
            })

            filterByOppurtunities = [...filterByOppurtunities, eachField]
        })

        let uniqueOppurtunityIDs = filterByOppurtunities.map((opps) => opps['Opportunity ID']).filter((value, index, self) => self.indexOf(value) === index);

        // uniqueOppurtunityID = [...new Set(data['OppurtunityID'])]
        // console.log("opp id : ", uniqueOppurtunityID)


        const getMyColor = (colorsLength) => {

            let r = [];
            for (let i = 0; i < colorsLength; i++) {
                let n = (Math.random() * 0xfffff * 1000000).toString(16);
                r.push('#' + n.slice(0, 6));
            }
            return r;
        };

        var myColor = d3.scaleSequential()
            .domain([0, uniqueOppurtunityIDs.length])
            .interpolator(d3.interpolateViridis);




        function rgbToHex(x) {

            let r = x.split("(")[1].split(")")[0].split(",")[0]
            let g = x.split("(")[1].split(")")[0].split(",")[1]
            let b = x.split("(")[1].split(")")[0].split(",")[2]
            return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
        }


        let uniqueHexColors = d3.scaleQuantize()
            .domain([0, 11])
            .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
                "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

        // previous color range
        // .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
        //     "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);


        // previous colors

        /*d3.scaleLinear()
            .domain([0, uniqueOppurtunityIDs.length])
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
            // Sample data
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

                // console.log("chart id : ", chart_id)

                var x = d3.scaleTime()
                    .domain([d3.min(filteredTimeline, function (d) { let min_date = d3.min(d.validDatesWithData); return parseDate(min_date); }),
                    d3.max(filteredTimeline, function (d) { let max_date = d3.max(d.validDatesWithData); return parseDate(max_date); })
                    ])
                    .range([0, width - margin.left - margin.right]);

                var xAxis = d3.axisBottom(x)

                let validDatesArray = filteredTimeline[0]['validDatesWithData']

                svg.selectAll(".dot")
                    .data(validDatesArray)
                    .enter().append("circle")
                    .attr("class", "dot")

                    .attr("cx", function (d) { return x(parseDate(d)) })
                    .attr("cy", height)
                    .attr("fill", "#fff")
                    .attr("r", 3)
                    .attr("stroke", "#000")

                    /* Code for coloring dots on timeline */

                    .attr("stroke", (d) => {
                        let uc
                        let currentOpportunity = filteredTimeline[0]['Opportunity ID']
                        for (let i = 0; i < uniqueOppurtunityIDs.length; i++) {
                            if (currentOpportunity.includes(uniqueOppurtunityIDs[i])) {
                                uc = uniqueHexColors(i)
                                break;
                            } else {
                                uc = "#FFC0CB"
                            }
                        }
                        return uc
                    })

                    .attr("stroke-width", "2")

                    .on("mouseover", function (d) {

                        let selectedDotDateText = filteredTimeline[0][d]

                        svg.selectAll(".dot").style("cursor", "pointer");
                        svg.select("path").style("cursor", "pointer");
                        d3.select(".pointed-arrow").style("visibility", "visible")

                        tooltip.html(`<div class="tooltip-close">X</div><div class="tooltip-text">${selectedDotDateText}<div>`)

                        document.getElementsByClassName("tooltip-close")[0]["onclick"] = closeTooltip;

                        tooltipArrow.style("visibility", "visible")
                            .style("top", (d3.event.pageY - 10) + "px")
                            .style("left", (d3.event.pageX - 30) + "px");


                        return tooltip.style("visibility", "visible")
                            .style("top", (d3.event.pageY + 25) + "px")
                            .style("left", (d3.event.pageX - 15) + "px");  // was 15 before
                    })

                // .on("mousemove", () => {

                //     return tooltip.style("top", (d3.event.pageY + 25) + "px")
                //         .style("left", (d3.event.pageX - 15) + "px")

                // })


                // .on("mouseout", () => {
                //     svg.selectAll(".dot").style("cursor", "default");
                //     svg.select("path").style("cursor", "default");
                //     return tooltip.style("visibility", "hidden")
                // });

                svg.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

            }

            var tooltipArrow = d3.select('.pointed-arrow')
                .style("visibility", "hidden")

            var tooltip = d3.select(".tooltip")
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

            // div for TITLE of chart

            d3.select(`.timeline${multidata_index}`)        // div for "Opportunity ID"
                .append("div")
                .attr("class", `opp-id${multidata_index} computer-names`)

            d3.select(`.timeline${multidata_index}`)        // div for "Account Name"
                .append("div")
                .attr("class", `acc-name${multidata_index} computer-names`)

            d3.select(`.timeline${multidata_index}`)        // div for "Opportunity Name"
                .append("div")
                .attr("class", `opp-name${multidata_index} computer-names`)


            // TITLE of the chart
            document.getElementsByClassName(`opp-id${multidata_index}`)[0].innerHTML = `Opportunity ID: ${filteredTimeline[multidata_index]["Opportunity ID"]}`
            document.getElementsByClassName(`acc-name${multidata_index}`)[0].innerHTML = `Account Name: ${filteredTimeline[multidata_index]["Account Name"]}`
            document.getElementsByClassName(`opp-name${multidata_index}`)[0].innerHTML = `Opportunity Name: ${filteredTimeline[multidata_index]["Opportunity Name"]}`


            // document.getElementsByClassName(`computer-id${multidata_index}`)[0].innerHTML = `Opportunity Name: ${uniqueComputers[multidata_index]}`



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
            }
        }

        if (fid == 0) {
            for (let multidata_index = 0; multidata_index < uniqueComputers.length; multidata_index++) {
                chart(multidata_index)
            }
        } else {
            let idOnUrl = fid;
            let indexOfUrlInJsonData = uniqueComputers.indexOf(idOnUrl)

            chart(indexOfUrlInJsonData)
        }

    })
    .catch(error => {
        // Handle any errors that occur during the request
        console.error('Error:', error);
});

import './style/style.css'
import './style/bootstrap.css'
import axios from 'axios'
import moment from 'moment'
import { io } from 'socket.io-client'

function refreshTable(newData) {
    const table = document.querySelector('table')
    const data = newData
    const list = Object.keys(data)
    let contributors = []
    list.forEach((username) => {
        contributors.push({
            username,
            easyIssuesSolved: data[username].easyIssuesSolved || 0,
            mediumIssuesSolved: data[username].mediumIssuesSolved || 0,
            hardIssuesSolved: data[username].hardIssuesSolved || 0,
            issuesNumber: data[username].issuesNumber || 0,
            totalScore: data[username].totalScore || 0,
            avatarUrl: data[username].avatarUrl,
            home: data[username].home,
        })
    })

    // Render total contributor numbers
    const totalNumbers = list.length
    const totalEm = document.querySelector('.total')
    totalEm.innerText = 'Total: ' + totalNumbers

    // Sort contributors by totalScore by default
    contributors = contributors.sort((a, b) => b.totalScore - a.totalScore)

    // Clear and populate the table
    table.innerHTML = `
        <tr>
            <td></td>
            <td colspan="1" style="font-weight: bold; padding: 8px;">Username</td>
            <td style="font-weight: bold; padding: 8px;">Easy Issues Solved</td>
            <td style="font-weight: bold; padding: 8px;">Medium Issues Solved</td>
            <td style="font-weight: bold; padding: 8px;">Hard Issues Solved</td>
            <td style="font-weight: bold; padding: 8px;">Issues Raised</td>
            <td style="font-weight: bold; padding: 8px;">Total Score</td>
        </tr>
    `

    contributors.forEach((contributor, index) => {
        const tr = document.createElement('tr')

        // Avatar
        const tdAvatar = document.createElement('td')
        const avatar = document.createElement('img')
        avatar.src = contributor.avatarUrl
        avatar.height = 42
        avatar.width = 42
        tdAvatar.appendChild(avatar)
        tr.appendChild(tdAvatar)

        // Username with rank
        const tdUsername = document.createElement('td')
        const usernameLink = document.createElement('a')
        const rank = document.createElement('span')
        usernameLink.href = contributor.home
        usernameLink.innerText = contributor.username
        rank.innerText = ` (#${index + 1})`
        rank.style.marginLeft = '10px'
        tdUsername.appendChild(usernameLink)
        tdUsername.appendChild(rank)
        tr.appendChild(tdUsername)

        // Easy Issues Solved
        const tdEasyIssues = document.createElement('td')
        tdEasyIssues.innerText = contributor.easyIssuesSolved
        tr.appendChild(tdEasyIssues)

        // Medium Issues Solved
        const tdMediumIssues = document.createElement('td')
        tdMediumIssues.innerText = contributor.mediumIssuesSolved
        tr.appendChild(tdMediumIssues)

        // Hard Issues Solved
        const tdHardIssues = document.createElement('td')
        tdHardIssues.innerText = contributor.hardIssuesSolved
        tr.appendChild(tdHardIssues)

        // Issues Raised
        const tdIssuesRaised = document.createElement('td')
        tdIssuesRaised.innerText = contributor.issuesNumber
        tr.appendChild(tdIssuesRaised)

        // Total Score
        const tdTotalScore = document.createElement('td')
        tdTotalScore.innerText = contributor.totalScore
        tr.appendChild(tdTotalScore)

        table.appendChild(tr)
    })

    // Display aggregated contributions info
    const allContributionsInfoRef = document.getElementById('allContributionsInfo')
    const totalEasy = contributors.reduce((sum, c) => sum + c.easyIssuesSolved, 0)
    const totalMedium = contributors.reduce((sum, c) => sum + c.mediumIssuesSolved, 0)
    const totalHard = contributors.reduce((sum, c) => sum + c.hardIssuesSolved, 0)
    const totalRaised = contributors.reduce((sum, c) => sum + c.issuesNumber, 0)
    const totalScores = contributors.reduce((sum, c) => sum + c.totalScore, 0)
    allContributionsInfoRef.innerText = `
        Easy: ${totalEasy}, Medium: ${totalMedium}, Hard: ${totalHard}, Raised: ${totalRaised}, Total Score: ${totalScores}
    `
}

axios.get('/api/data')
    .then(res => {
        refreshTable(res.data)
    })

axios.get('/api/config')
    .then(res => {
        const { organization, organizationGithubUrl, organizationHomepage } = res.data
        const footer = document.querySelector('.footer .text-muted')
        footer.innerHTML = `
        <a href="${organizationHomepage}" target="_blank" rel="noopener noreferrer">${organizationHomepage}</a> |
        <a href="${organizationGithubUrl}" target="_blank" rel="noopener noreferrer">Github(${organization})</a>`.trim()
    })

axios.get('/api/log')
    .then(res => {
        const { starttime, endtime } = res.data
        const relativeTime = moment(new Date(endtime)).from(new Date(starttime))
        console.log(relativeTime)
        if (relativeTime.match(/[\da]+.+/) !== null) {
            const lastupdate = document.querySelector('.lastupdate')
            lastupdate.innerText = `Last Updated: ${relativeTime.match(/[\da]+.+/)[0]} ago`
        }
    })

const socket = io()
socket.on('refresh table', (data) => {
    refreshTable(data)
})

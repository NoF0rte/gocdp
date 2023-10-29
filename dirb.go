package gocdp

import (
	"bytes"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var (
	dirbRegex       *regexp.Regexp = regexp.MustCompile(`DIRB\s*v[0-9]+\.[0-9]+`)
	dirbResultRegex *regexp.Regexp = regexp.MustCompile(`^\+\s*(?P<url>https?://[^\s]+)\s*\(CODE:(?P<status>[0-9]+)\|SIZE:(?P<length>[0-9]+)\)`)
	dirbDirRegex    *regexp.Regexp = regexp.MustCompile(`==>\s*DIRECTORY:\s*([^ ]+)`)

	// (Location: '/user/not_authorized')
	dirbRedirectRegex *regexp.Regexp = regexp.MustCompile(`^\s*\(Location: '([^']+)'\)`)
)

type DirbParser struct {
}

func (parser DirbParser) Parse(input string) (CDResults, error) {
	var results CDResults
	isResultRegex := regexp.MustCompile(`^(\+|==>)\s*`)

	lines := strings.Split(input, "\n")
	for i, line := range lines {
		if !isResultRegex.MatchString(line) {
			continue
		}
		var result CDResult

		match := dirbResultRegex.FindStringSubmatch(line)
		if len(match) == 0 {
			match = dirbDirRegex.FindStringSubmatch(line)
			result = CDResult{
				Url:           match[1],
				Status:        200, // Going to assume that directory matches are 200
				Redirect:      "",
				ContentType:   "",
				ContentLength: 0,
				source:        line,
			}
		} else {
			namedMatches := make(map[string]string)
			for j, name := range dirbResultRegex.SubexpNames() {
				if j != 0 && name != "" {
					namedMatches[name] = match[j]
				}
			}

			status, _ := strconv.Atoi(namedMatches["status"])
			length, _ := strconv.Atoi(namedMatches["length"])

			result = CDResult{
				Url:           namedMatches["url"],
				Status:        status,
				ContentLength: length,
				ContentType:   "",
				source:        line,
			}

			if i+1 < len(lines) {
				nextLine := lines[i+1]
				matches := dirbRedirectRegex.FindStringSubmatch(nextLine)
				if len(matches) == 2 && matches[1] != "" {
					if result.IsRedirect() {
						result.Redirect = matches[1]
					}

					// Always add it to source
					result.source = fmt.Sprintf("%s\n%s", result.source, nextLine)
				}
			}
		}

		results = append(results, result)
	}

	return results, nil
}

func (parser DirbParser) CanParse(input string) bool {
	return dirbRegex.MatchString(input)
}

func (p DirbParser) CanTransform() bool {
	return true
}

func (p DirbParser) Transform(input string, filtered []interface{}) (string, error) {
	beforeRegex := regexp.MustCompile(`----\s*Scanning\s*URL:\s*[^ ]+\s*----`)
	afterRegex := regexp.MustCompile(`-----------------\nEND_TIME:\s*`)

	writer := bytes.NewBuffer(nil)

	for _, l := range filtered {
		writer.WriteString(fmt.Sprintln(l))
	}

	before := beforeRegex.FindStringIndex(input)[1]
	after := afterRegex.FindStringIndex(input)[0]

	return fmt.Sprintf("%s\n%s\n%s", input[0:before], writer.String(), input[after:]), nil
}

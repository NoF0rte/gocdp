package gocdp

import (
	"regexp"
	"strconv"
	"strings"
)

var dirbRegex *regexp.Regexp = regexp.MustCompile(`DIRB\s*v[0-9]+\.[0-9]+`)

type DirbParser struct {
}

func (parser DirbParser) Parse(input string) (CDResults, error) {
	var results CDResults
	isResultRegex := regexp.MustCompile(`^\+\s*`)
	resultRegex := regexp.MustCompile(`^\+\s*(?P<url>https?://[^\s]+)\s*\(CODE:(?P<status>[0-9]+)\|SIZE:(?P<length>[0-9]+)\)`)

	// (Location: '/user/not_authorized')
	redirectRegex := regexp.MustCompile(`^\s*\(Location: '([^']+)'\)`)

	lines := strings.Split(input, "\n")
	for i, line := range lines {
		if !isResultRegex.MatchString(line) {
			continue
		}
		match := resultRegex.FindStringSubmatch(line)

		namedMatches := make(map[string]string)
		for j, name := range resultRegex.SubexpNames() {
			if j != 0 && name != "" {
				namedMatches[name] = match[j]
			}
		}

		status, _ := strconv.Atoi(namedMatches["status"])
		length, _ := strconv.Atoi(namedMatches["length"])

		result := CDResult{
			Url:           namedMatches["url"],
			Status:        status,
			ContentLength: length,
			ContentType:   "",
		}

		if result.IsRedirect() {
			matches := redirectRegex.FindStringSubmatch(lines[i+1])
			if matches[1] != "" {
				result.Redirect = matches[1]
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
	return false
}

func (p DirbParser) Transform(input string, filtered []interface{}) (string, error) {
	return "", nil
}

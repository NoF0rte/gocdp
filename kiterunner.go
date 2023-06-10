package gocdp

import (
	"strconv"
	"strings"
)

var (
// gbRegex     *regexp.Regexp = regexp.MustCompile(`Gobuster\s+v[0-9]+\.[0-9]+\.[0-9]+`)
// resultRegex *regexp.Regexp = regexp.MustCompile(`^\s*(?P<url>https?://[^\s]+)\s*\(Status:\s*(?P<status>[0-9]+)\)\s*\[Size:\s*(?P<length>[0-9]+)\](?:\s*\[-->\s*(?P<redirect>[^\s]+)\s*])?`)
)

type KiterunnerParser struct {
}

func (parser KiterunnerParser) Parse(input string) (CDResults, error) {
	var results CDResults
	lines := strings.Split(input, "\n")
	for _, line := range lines {
		match := resultRegex.FindStringSubmatch(line)
		if len(match) == 0 {
			continue
		}

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
			result.Redirect = namedMatches["redirect"]
		}

		results = append(results, result)
	}

	return results, nil
}

func (parser KiterunnerParser) CanParse(input string) bool {
	return gbRegex.MatchString(input)
}

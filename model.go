package gocdp

import (
	"sort"
	"strings"
)

var statusCodeGroups = []int{
	100,
	200,
	300,
	400,
	500,
}

type CDResults []CDResult

// GroupByStatusRange groups the results by status ranges e.g. all results with the status code in the range of 200 - 299 are grouped
func (results CDResults) GroupByStatusRange() map[int][]CDResult {
	grouped := make(map[int][]CDResult)
	for _, result := range results {
		var status int
		for i, code := range statusCodeGroups {
			if i == len(statusCodeGroups)-1 {
				status = code
				break
			}

			if result.Status >= code && result.Status < statusCodeGroups[i+1] {
				status = code
				break
			}
		}
		grouped[status] = append(grouped[status], result)
	}

	for _, group := range grouped {
		sort.Slice(group, func(i, j int) bool {
			first := group[i]
			second := group[j]
			if first.Status == second.Status {
				return strings.Compare(first.Url, second.Url) > 1
			}
			return first.Status < second.Status
		})
	}
	return grouped
}

// GroupByStatus groups the results by the status code e.g. all results with the status code of 302 are grouped
func (results CDResults) GroupByStatus() map[int][]CDResult {
	grouped := make(map[int][]CDResult)
	for _, result := range results {
		grouped[result.Status] = append(grouped[result.Status], result)
	}

	for _, group := range grouped {
		sort.Slice(group, func(i, j int) bool {
			first := group[i]
			second := group[j]
			if first.Status == second.Status {
				return strings.Compare(first.Url, second.Url) > 1
			}
			return first.Status < second.Status
		})
	}
	return grouped
}

// UniqueByURL returns CDResults with no duplicate URLs
func (results CDResults) UniqueByURL() CDResults {
	var unique CDResults

	set := make(map[string]bool)
	for _, result := range results {
		_, found := set[result.Url]
		set[result.Url] = true

		if !found {
			unique = append(unique, result)
		}
	}

	return unique
}

type CDResult struct {
	Url           string
	Status        int
	Redirect      string
	ContentType   string
	ContentLength int

	source interface{}
}

func (result CDResult) IsRedirect() bool {
	return result.Redirect != "" || (result.Status >= 300 && result.Status < 400)
}
func (result CDResult) IsSuccess() bool {
	return result.Status >= 200 && result.Status < 300
}
func (result CDResult) IsError() bool {
	return result.Status >= 400
}
func (result CDResult) IsAuthError() bool {
	return result.Status == 401 || result.Status == 403
}
func (result CDResult) IsRateLimit() bool {
	return result.Status == 429
}

func (result CDResult) IsStatus(statusCodes ...int) bool {
	for _, status := range statusCodes {
		if result.Status == status {
			return true
		}
	}
	return false
}
